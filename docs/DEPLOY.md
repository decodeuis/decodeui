generate spf: https://mxtoolbox.com/SPFRecordGenerator.aspx
but its not valid syntax fix it:
SPF Syntax Validator:
https://vamsoft.com/support/tools/spf-syntax-validator
Generate DMAC Record:
https://dmarcguide.globalcyberalliance.org

follow this steps:
Unlock High Inbox Delivery 💯 Build SMTP Server with CyberPanel & Send Bulk Emails | CyberPanel Guide
https://www.youtube.com/watch?v=Q37-qeYdiYY
Notes while setup first time:
we should use ubuntu 22, as 24 is not yet supported.
1. on reverse dns set mail.decodeui.io
2. we need to setup spf and DKIM1 and DMARC1 records.
on initial configuration on cyberpanel use: mail.decodeui.io (first we neet to setup *.decodeui.io in dns)
Test score should be 10/10:
https://www.mail-tester.com

sudo hostnamectl set-hostname mail.decodeui.io
sudo nano /etc/hosts
# https://cyberpanel.net/KnowledgeBase/home/install-cyberpanel/
sudo apt update && sudo apt upgrade -y
sh <(curl https://cyberpanel.net/install.sh || wget -O - https://cyberpanel.net/install.sh)
https://mail.decodeui.io:8090/
https://mail.decodeui.io:7080/
after email setup we need to setup app server:
1. install java, neo4j, start and change password (connect with ssh in editor, forward two port 7474, 7687). 
   sudo apt install openjdk-21-jdk
2. install node using volta
3. setup git
   sudo apt install git -y
   authenticate git, create a new ssh key in .ssh folder and upload public key to git
4. clone project, create .env file, update .env file for email and db, install packages (npm i --force),  install playwright (npx playwright install), build,  install dotenv globally (npm install -g dotenv-cli) and start
5. go do to admin subdomain, login and create www subdomain.
## SSL Setup
- even if we don't use domain without subdomain, we still need certificate for it, else redirect from https://decodeui.io to htts://www.decodeui.io will not work.
- Setup a wildcard domain including free SSL | Let's Encrypt: [YouTube Tutorial](https://www.youtube.com/watch?v=oJ_sP9y9KWo)
  git clone https://github.com/acmesh-official/acme.sh.git
  ./acme.sh --install -m kapil.pipaliya@yahoo.com
  Setup default certification authority
  acme.sh --issue -d decodeui.io -d *.decodeui.io --dns  --yes-I-know-dns-manual-mode-enough-go-ahead-please --set-default-ca --server letsencrypt
  Issue cert
  acme.sh --issue -d decodeui.io -d *.decodeui.io --dns  --yes-I-know-dns-manual-mode-enough-go-ahead-please
  add TXT record to dns.
  Renew cert
  acme.sh --issue -d decodeui.io -d *.decodeui.io --dns  --yes-I-know-dns-manual-mode-enough-go-ahead-please --renew
  It will generate keys like:
  our cert is in: /root/.acme.sh/decodeui.io_ecc/*.decodeui.io.cer 	Just your domain cert 
  our cert key is in: /root/.acme.sh/decodeui.io_ecc/*.decodeui.io.key Private key (sensitive!)
  The intermediate CA cert is in: /root/.acme.sh/decodeui.io_ecc/ca.cer Intermediate cert(s) only
  And the full-chain cert is in: /root/.acme.sh/decodeui.io_ecc/fullchain.cer Domain cert + intermediate chain
  Past your fullchain.cer and key on cyberpanel
5. configure cyberpanel to use this server as reverse proxy (rewrite rule)
RewriteEngine On

# Redirect to www if no subdomain is present
RewriteCond %{HTTP_HOST} ^decodeui\.io$ [NC]
RewriteRule ^(.*)$ https://www.decodeui.io/$1 [R=301,L]

# Force HTTPS
RewriteCond %{HTTPS} !=on
RewriteRule ^/?(.*) https://%{SERVER_NAME}/$1 [R,L]

# Proxy requests to internal server
RewriteRule ^(.*)$ http://decodeuiio/$1 [P,NE,L]
6. configure openlight speed to serve all subdomains.
   Server Configuration -> External App -> New -> Web Server -> 
   name: decodeuiio
   Address: localhost:3001
   Max Connections: 2000
   Initial Request Timeout (secs) 100
   Retry Timeout (secs) 2
   Listners -> default -> decodeui.io -> decodeui.io, *.decodeui.io
   do in other listners too
   Graceful restart
7. renew SSL every month, using acme tool for all subdomains.

Node: do not reset admin database because if we change it we need to also reset all the databases too.