import { type BrowserContext, chromium, type Page } from "playwright";

import { isDev } from "~/pages/settings/constants";

import { API } from "../api/endpoints";

interface BrowserSetup {
  browser: Awaited<ReturnType<typeof chromium.launch>>;
  context: BrowserContext;
  page: Page;
}

interface RenderResult {
  error?: string;
  html?: string;
  success: boolean;
}

interface SendPageOptions {
  pageName: string;
  queryParams?: Record<string, string>;
  secureToken?: string;
  subDomain: string;
}

export async function renderPageAsHtml({
  pageName,
  queryParams = {},
  secureToken,
  subDomain,
}: SendPageOptions): Promise<RenderResult> {
  let browser;

  try {
    const browserSetup = await setupBrowserAndPage(
      pageName,
      queryParams,
      subDomain,
      secureToken,
    );
    browser = browserSetup.browser;

    // Convert all relative links to absolute links
    await convertRelativeLinksToAbsolute(browserSetup.page);

    // Get page content
    let html = await browserSetup.page.content();

    if (!html) {
      throw new Error("Failed to render page");
    }

    // Remove all script tags
    html = html.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      "",
    );

    return { html, success: true };
  } catch (error) {
    console.error("Error rendering page:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
      success: false,
    };
  } finally {
    await browser?.close();
  }
}

/**
 * Converts all relative URLs in the page to absolute URLs
 */
async function convertRelativeLinksToAbsolute(page: Page): Promise<void> {
  // Extract base URL from current page URL (protocol + domain)
  const baseUrl = page.url().split("/").slice(0, 3).join("/");

  await page.evaluate((baseUrl) => {
    /**
     * Converts a relative URL to an absolute URL
     */
    function toAbsoluteUrl(relativeUrl: string, baseUrl: string): string {
      if (relativeUrl.startsWith("/")) {
        // Absolute path relative to domain
        return `${baseUrl}${relativeUrl}`;
      }
      // Relative path
      return `${baseUrl}/${relativeUrl}`;
    }

    /**
     * Processes elements with the specified attribute and converts relative URLs to absolute
     */
    function processElementUrls(selector: string, attribute: string): void {
      const elements = document.querySelectorAll(`${selector}[${attribute}]`);
      for (const element of elements) {
        const url = element.getAttribute(attribute);
        if (
          url &&
          !url.startsWith("http") &&
          !url.startsWith("mailto:") &&
          !url.startsWith("#") &&
          !url.startsWith("data:")
        ) {
          element.setAttribute(attribute, toAbsoluteUrl(url, baseUrl));
        }
      }
    }

    /**
     * Extracts URL from CSS url() function
     */
    function extractUrlFromCssValue(cssValue: string): null | string {
      const urlMatch = cssValue.match(/url\(['"]?([^'")]+)['"]?\)/i);
      return urlMatch ? urlMatch[1] : null;
    }

    /**
     * Processes inline style background images
     */
    function processInlineBackgroundImages(): void {
      const elements = document.querySelectorAll('[style*="background"]');
      for (const element of elements) {
        const style = (element as HTMLElement).style;
        const backgroundImage = style.backgroundImage;

        if (backgroundImage?.includes("url(")) {
          const url = extractUrlFromCssValue(backgroundImage);
          if (url && !url.startsWith("http") && !url.startsWith("data:")) {
            style.backgroundImage = `url("${toAbsoluteUrl(url, baseUrl)}")`;
          }
        }
      }
    }

    /**
     * Processes all CSS rules in stylesheets to convert background image URLs
     */
    function processStylesheetBackgroundImages(): void {
      // Process all stylesheets in the document
      const stylesheets = Array.from(document.styleSheets);
      for (const stylesheet of stylesheets) {
        try {
          // Skip if stylesheet is from a different origin (CORS restriction)
          if (
            stylesheet.href &&
            !stylesheet.href.startsWith(window.location.origin)
          ) {
            continue;
          }

          // Process all CSS rules
          const cssRules = Array.from(stylesheet.cssRules || []);
          for (const rule of cssRules) {
            if (rule instanceof CSSStyleRule) {
              const style = rule.style;

              // Check for background-image property
              if (style.backgroundImage?.includes("url(")) {
                const url = extractUrlFromCssValue(style.backgroundImage);
                if (
                  url &&
                  !url.startsWith("http") &&
                  !url.startsWith("data:")
                ) {
                  style.backgroundImage = `url("${toAbsoluteUrl(url, baseUrl)}")`;
                }
              }

              // Also check for background shorthand property
              if (style.background?.includes("url(")) {
                const url = extractUrlFromCssValue(style.background);
                if (
                  url &&
                  !url.startsWith("http") &&
                  !url.startsWith("data:")
                ) {
                  // Replace just the URL part in the background shorthand
                  style.background = style.background.replace(
                    /url\(['"]?([^'")]+)['"]?\)/i,
                    `url("${toAbsoluteUrl(url, baseUrl)}")`,
                  );
                }
              }
            }
          }
        } catch (e) {
          // Silently handle CORS errors when accessing cross-origin stylesheets
          console.warn("Could not process stylesheet:", e);
        }
      }
    }

    // Process different types of elements with URLs
    processElementUrls("a", "href");
    processElementUrls("img", "src");
    processElementUrls("link", "href");
    processElementUrls("script", "src");

    // Process CSS background images
    processInlineBackgroundImages();
    processStylesheetBackgroundImages();
  }, baseUrl);
}

async function setupBrowserAndPage(
  pageName: string,
  queryParams: Record<string, string>,
  subDomain: string,
  token?: string,
): Promise<BrowserSetup> {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const searchParams = new URLSearchParams(queryParams);
  const redirectUrl = `/internal/email-templates/${pageName}`;

  if (token) {
    searchParams.set("token", token);
    searchParams.set("redirect", redirectUrl);
  }

  const domainPort = process.env.DOMAIN_PORT
    ? `:${process.env.DOMAIN_PORT}`
    : "";
  const isDomainLocalhost = process.env.DOMAIN === "localhost";
  const subDomainPart =
    subDomain && subDomain !== "admin"
      ? `${subDomain}.`
      : isDomainLocalhost
        ? ""
        : "admin.";
  const isDevEnvironment = isDev || isDomainLocalhost;
  const protocol = isDevEnvironment ? "http" : "https";
  const baseUrl = `${protocol}://${subDomainPart}${process.env.DOMAIN}${isDevEnvironment ? domainPort : ""}`;
  const queryString = searchParams.toString();

  const url = token
    ? `${baseUrl}${API.auth.autoSignInUrl}?${queryString}`
    : `${baseUrl}${redirectUrl}${queryString ? `?${queryString}` : ""}`;

  await page.goto(url);
  await page.waitForLoadState("networkidle");

  return { browser, context, page };
}
