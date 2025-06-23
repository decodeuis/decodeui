/**
 * Utility functions for the layout tree components
 */

/**
 * Gets the border color for a tree item based on its nesting level
 * @param index - The nesting level index
 * @returns A color hex code
 */
export const getTreeItemColor = (index = 0): string => {
  const colors = [
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F97316", // Orange
    "#8B5CF6", // Purple
    "#EC4899", // Pink
  ];
  return colors[index % colors.length];
};

/**
 * Gets the border style for a tree item based on its nesting level
 * @param index - The nesting level index
 * @returns A CSS border style
 */
export const getTreeItemBorderStyle = (index: number): string => {
  const styles = ["solid", "dashed", "dotted"];
  return styles[index % styles.length];
};

/**
 * Gets border properties for a tree item at a specific nesting level
 * @param index - The nesting level index
 * @returns An object with color and style properties
 */
export const getTreeItemBorder = (index: number) => {
  return {
    color: getTreeItemColor(index),
    style: getTreeItemBorderStyle(index),
  };
};

/**
 * Gets CSS for selected tree item styling
 * @returns CSS string for selected item styling
 */
export const getSelectedItemStyle = () => {
  return `
    background-color: \${args.theme.var.color.primary_light_100}; 
    color: \${args.theme.var.color.primary_light_100_text};
    border-left: 3px solid \${args.theme.var.color.primary}; 
    box-shadow: 0 0 4px \${args.theme.var.color.primary_light_600};
  `;
};
