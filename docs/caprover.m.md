# Source: https://caprover.com/docs/troubleshooting.html

## URL: https://caprover.com/docs/troubleshooting.html

Title: Troubleshooting · CapRover

URL Source: https://caprover.com/docs/troubleshooting.html

Markdown Content:
This section covers most frequent issues that users may encounter.

Cannot connect <ip_server>:3000?
--------------------------------

There is a whole set of reasons for this.

#### First)

You need to make sure that CapRover is running on your server. To check this, ssh to your server and run

```
docker service ps captain-captain --no-trunc
```

You might see Captain is getting restarted constantly due to an error. Fix the issue and retry. For example, see [error creating vxlan interface](https://github.com/caprover/caprover/issues/14#issuecomment-345447689), or [error while creating mount source path](https://github.com/caprover/caprover/issues/352). Linode, for example, has many problems, such as [subnet sandbox join failed](https://github.com/docker/machine/issues/2753#issuecomment-171822791) and [vxlan interface](https://github.com/docker/machine/issues/2753#issuecomment-188353704). Search [CapRover Github issues](https://github.com/caprover/caprover/issues) for your problem and if you can't find a solution, create a new issue on Github.

#### Second)

If you don't see any errors when your ran `docker service ps captain-captain --no-trunc`, then try

```
docker service logs captain-captain --since 60m

## you should also get the logs from nginx

docker service logs captain-nginx --since 60m
```

You might see that CapRover is getting restarted constantly due to an error. Search [CapRover Github issues](https://github.com/caprover/caprover/issues) for your problem and if you can't find a solution, create a new issue on Github.

#### Third)

If both "First" and "Second" debugging steps explained above worked fine and there is no error seen in the logs, run this command on your server:

```
curl localhost:3000 -v
```

If successful, it's probably your firewall that's blocking the connection. See [Firewall Docs](https://caprover.com/docs/firewall.html).

Successful Deploy but 502 bad gateway error!
--------------------------------------------

This applies to you if:

*   You have been able to setup your server and access it via `captain.rootdomain.example.com`.
*   You have been able to deploy one of the samples apps (see [here](https://github.com/caprover/caprover/tree/master/captain-sample-apps)) successfully and it worked.
*   You tried to deploy your own application and it deployed successfully, but when you try to access it via `yourappname.root.example.com` you get a 502 error.

If all above points are correct, this is how to troubleshoot:

*   SSH to your server and view your application logs. Make sure it hasn't crashed and it's running. To view logs, please see the section at the end of this page "[How to view my application's log](https://caprover.com/docs/troubleshooting.html#how-to-view-my-applications-log)"
*   If you application logs show that your application is running, the most common case is that your application is binding to a custom port, not port 80. For example, CouchDB runs at port 5984. In this case, go to app's settings on CapRover, go to HTTP Settings, then select 5984 as the "Container Port".
*   If your app defines the binding IP address as 127.0.0.1, change it to `0.0.0.0`, see [this issue](https://github.com/caprover/caprover/issues/76#issuecomment-481053496) for more details.

Domain Verification Failed - Error 1107!
----------------------------------------

This happens when CapRover cannot verify that yourcustomdomain.com points to the IP address of CapRover. This can be caused by several factors:

*   DNS changes take up to 24 hrs to propagate, specially if your server had cached them before. So wait for 24hrs and retry again. If it doesn't work, proceed to the next step:
*   To confirm, go to [https://mxtoolbox.com/DNSLookup.aspx](https://mxtoolbox.com/DNSLookup.aspx) and enter `yourcustomdomain.com`. Make sure it points to the server IP. If you're using a proxy service like CloudFlare, this may cause a problem. Disable their proxy in your DNS on CloudFlare and have A record directly point to the IP address of your CapRover server.
*   If you tested all above, and when you visit `something.domain.com` you see the CapRover page, then you can say your domain is working fine, but CapRover is unable to verify it because the loopback test doesn't work. In this case, you can choose to skip domain verification done by CapRover:

```
echo  "{\"skipVerifyingDomains\":\"true\"}" >  /captain/data/config-override.json
docker service update captain-captain --force
```

*   If none of the above works, please open an issue on Github.
*   **AWS EC2 Users** - Check to make sure the CIDR Block of your VPC is above 172.0.0.0/16 (NOT 0.0.0.0/16, which is common).

Connection Timeouts
-------------------

Sometimes when you have an inactive database connection pool, Docker drops the connection after some time. To fix, you can do either of these:

*   Implement an automatic retry strategy
*   Implement a automatic ping every few minutes to ensure that the connection doesn't become inactive
*   Changing Keepalive config in your app (see [here](https://github.com/caprover/caprover/issues/873#issuecomment-715328966) for an example on knex)
*   Make changes to your Docker configs (more advanced)

The [root cause](https://github.com/moby/moby/issues/31208) is not related to CapRover, it's an underlying Docker issue.

Something bad happened
----------------------

When you see this error in the UI, it means something "unexpected" went wrong such as connection lost, server crashing (due to out of memory), etc. The best way to see what's happening is to get the server logs:

```
docker service logs captain-captain --since 5m --follow
```

How to view my application's log?
---------------------------------

Your application is deployed as a Docker service. For example, if your app name in captain is `my-app` you can view your logs by connecting to your server via SSH and run the following command:

```
docker service logs srv-captain--my-app --since 60m --follow
```

Note that Docker service name is prefixed with `srv-captain--`. Also, you can replace 60m with 10m to view last 10 minutes.

How to restart my application?
------------------------------

If your application is not behaving well, you can try force restarting it by going to the web dashboard and select your app, then click on "Save Configuration & Update" button. It will forcefully restarts your application.

How to run shell inside my application (inside container)
---------------------------------------------------------

Simply run the following command:

```
docker exec -it $(docker ps --filter name=srv-captain--myappname -q) /bin/sh
```

Of course, you need to replace `myappname` with your own app name.

I've made a change to the Nginx config that broke the admin UI!
---------------------------------------------------------------

In this case restart is not going to help. [Do this](https://github.com/caprover/caprover/issues/412#issuecomment-484077130):

Run the nginx fixer to revert **all nginx changes that you've manually made**:

```
docker service scale captain-captain=0 && \
docker run -it --rm -v /captain:/captain  caprover/caprover /bin/sh -c "wget https://raw.githubusercontent.com/caprover/caprover/master/dev-scripts/clear-custom-nginx.js ; node clear-custom-nginx.js ;" && \
docker service scale captain-captain=1 && \
echo "OKAY"
```

Hopefully your problem should be resolved and you can be happy.

How to restart CapRover
-----------------------

If your CapRover is not behaving well, you can try force restarting CapRover using:

```
docker service update captain-captain --force
```

How to use the Edge version
---------------------------

Edge version gets automatically built with every push on master. If your version has a particular bug that is just fixed on master branch, you can temporarily update your CapRover to use the Edge version. Note that once you switch to edge, you won't receive updates. With the next release of CapRover, you have to manually switch back to CapRover. Note that this is an advance operations. Also, as a rule of thumb, once you switch to Edge, do not switch back to the regular version until a new version is released.

To switch to edge

```
docker pull caprover/caprover-edge:latest
docker service update captain-captain --image caprover/caprover-edge:latest
```

To switch back to the main image

```
docker service update captain-captain --image caprover/caprover:latest
```

Customize Config Settings
-------------------------

You can customize any constant defined in [CaptainConstants](https://github.com/caprover/caprover/blob/master/src/utils/CaptainConstants.ts) under configs by adding a JSON file at `/captain/data/config-override.json`. For example, to change `defaultMaxLogSize`, the content of `/captain/data/config-override.json` will be:

```
{
 "defaultMaxLogSize":"128m"
}
```

After editing this file, [restart CapRover](https://caprover.com/docs/troubleshooting.html#how-to-restart-caprover) (if the change affects CapRover, nginx or certbot) or turn NetData off and on again from the UI.

Use existing swarm
------------------

When you first install CapRover, it tries to automatically set up a swarm cluster for you. But in rare cases, you may already have a swarm cluster, and you want to use that cluster. In this case, you can simply just override it by setting `useExistingSwarm` to true. Run the following script before attempting to install CapRover.

```
mkdir -p  /captain/data
echo  "{\"useExistingSwarm\":\"true\"}" >  /captain/data/config-override.json
```

AWS setup
---------

AWS has its own customization with regards to port handling and etc. It make require some custom setup, see [this blog post for example](https://fuzzyblog.io/blog/caprover/2019/11/10/using-caprover-on-aws.html).

CloudFlare SSL setup
--------------------

When using CloudFlare free plan, keep in mind its [Universal SSL only supports SSL up to 1st level subdomains](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/limitations/#full-setup). So, if you enable CloudFlare's Universal SSL and set up a 1st level subdomain as a root domain for CapRover, you'll get the following error when trying to access the apps deployed by CapRover:

```
This site can’t provide a secure connection
app.root.example.com uses an unsupported protocol.
ERR_SSL_VERSION_OR_CIPHER_MISMATCH
```

If you want to use CapRover with the CloudFlare's Universal SSL, avoid using a subdomain as a root domain.

ARM processor
-------------

As of 1.8.1, CapRover works on arm processors like "raspberry pi" and such. Note that some one click apps may not work on rasberry pi. One click apps are external apps that are not maintained by CapRover.

Reset Password
--------------

If you forgot your password but you have access to your server via SSH:

*   SSH to your server
*   Run `jq -V` to make you have jq installed
*   Run

```
docker service scale captain-captain=0

# backup config
cp /captain/data/config-captain.json /captain/data/config-captain.json.backup

# delete old password
jq 'del(.hashedPassword)' /captain/data/config-captain.json > /captain/data/config-captain.json.new
cat /captain/data/config-captain.json.new > /captain/data/config-captain.json
rm /captain/data/config-captain.json.new

# set a temporary password
docker service update --env-add DEFAULT_PASSWORD=mytemppassword captain-captain
docker service scale captain-captain=1
```

*   Login to CapRover with your temporary password and change your password from settings.

How to stop and remove Captain?
-------------------------------

CapRover uses docker swarm to support clustering and restarting containers if they stop. In order to fully uninstall CapRover from your system, run this:

```
docker service rm $(docker service ls -q)
## remove CapRover settings directory
rm -rf /captain
## leave swarm if you don't want it
docker swarm leave --force
## full cleanup of docker
docker system prune --all --force
```

I got an email from Let's Encrypt saying my domain's SSL certificate is expiring, and it shouldn't be.
------------------------------------------------------------------------------------------------------

This can happen when you've used the same domain name for a previous project, which you then deleted. Let's Encrypt keeps track of the old certificate and notifies you when it is due to expire, but this doesn't affect the new certificate. To confirm, simply just check your SSL expiry date using an online tool like this: [https://www.sslshopper.com/ssl-checker.html#hostname=captain.server.demo.caprover.com](https://www.sslshopper.com/ssl-checker.html#hostname=captain.server.demo.caprover.com)

---


# Crawl Statistics

- **Source:** https://caprover.com/docs/troubleshooting.html
- **Depth:** 1
- **Pages processed:** 1
- **Crawl method:** api
- **Duration:** 2.11 seconds
- **Crawl completed:** 2/26/2026, 8:50:50 PM

# Source: https://caprover.com/docs

## URL: https://caprover.com/docs

Title: Page not found · GitHub Pages

URL Source: https://caprover.com/docs

Warning: Target URL returned error 404: Not Found

Markdown Content:
404
---

**File not found**

The site configured at this address does not contain the requested file.

If this is your site, make sure that the filename case matches the URL as well as any file permissions.

 For root URLs (like `http://example.com/`) you must provide an `index.html` file.

[Read the full documentation](https://help.github.com/pages/) for more information about using **GitHub Pages**.

[GitHub Status](https://githubstatus.com/) — [@githubstatus](https://twitter.com/githubstatus)

[![Image 1](blob:http://localhost/6691b6771aee6d71f28885ba1e6cb58e)](https://caprover.com/)[![Image 2](blob:http://localhost/a718d401a153f4ec3816bbbebdadb6c4)](https://caprover.com/)

---


# Crawl Statistics

- **Source:** https://caprover.com/docs
- **Depth:** 2
- **Pages processed:** 1
- **Crawl method:** api
- **Duration:** 3.81 seconds
- **Crawl completed:** 2/26/2026, 8:52:15 PM

# Source: https://caprover.com/docs/get-started.html

## URL: https://caprover.com/docs/get-started.html

Title: Getting Started · CapRover

URL Source: https://caprover.com/docs/get-started.html

Markdown Content:
Simple Setup
------------

The recommended method to install CapRover is via DigitalOcean one-click app. CapRover is available as a One-Click app in DigitalOcean marketplace.

Note that if you are a new DigitalOcean user, you will receive **$100 Free Credit** once you sign up for the first two months. This is enough for two months of multiple servers!

If you use this method, you can skip **Prerequisites** section and step 1 of **CapRover Setup** below!

[![Image 1: CreateDroplet](https://caprover.com/img/do-btn-blue.svg)](https://marketplace.digitalocean.com/apps/caprover?action=deploy&refcode=6410aa23d3f3)

Prerequisites
-------------

### A) Domain Name

During installation, you'll be asked to point a wildcard DNS entry to your CapRover IP Address. This will cost you as low as $2 a year (or [even less](https://www.reddit.com/r/selfhosted/comments/sp8etq/comment/hwdgztx/?utm_source=reddit&utm_medium=web2x&context=3)!)

Note that you can use CapRover without a domain too. But you won't be able to setup HTTPS.

### B) Server

#### B1) Public IP

_Side note: You can [install CapRover locally](https://caprover.com/docs/run-locally.html) on your laptop on a private network which is behind NAT (your router). But if you want to enable HTTPS and/or access the apps from outside of your private network, it requires some special setup, like port forwarding._

In standard installation, CapRover has to be installed on a machine with a public IP address. If you need help with Public IP, see [Server & Public IP address](https://caprover.com/docs/server-purchase/digitalocean.html). This will cost you as low as $5 a month. If you use the DigitalOcean referral code, you'll get $100 credit - two months worth of free server: [https://m.do.co/c/6410aa23d3f3](https://m.do.co/c/6410aa23d3f3)

#### B2) Server Specs

_**CPU Architecture**:_ CapRover source code is compatible with any CPU architecture and the Docker build available on Docker Hub is built for AMD64 (X86), ARM64, and ARMV7 CPUs.

_**Recommended Stack**:_ CapRover is tested on Ubuntu 22.04 and Docker 25+. If you're using CapRover on a different OS, you might want to look at [Docker Docs](https://docs.docker.com/engine/userguide/storagedriver/selectadriver/#supported-storage-drivers-per-linux-distribution).

_**Ubuntu 24.04**:_ This version [has been tested](https://github.com/caprover/caprover/issues/2244) by multiple people and there seems to be no known issues with this version.

_**Minimum RAM**:_ Note that the build process sometimes consumes too much RAM, and 512MB RAM might not be enough (see [this issue](https://github.com/caprover/caprover/issues/28)). Most providers offer a minimum of 1GB RAM on $5 instance including DigitalOcean, Vultr, Scaleway, Linode, SSD Nodes and etc.

#### B3) Docker

Your server must have Docker installed on it. If you get your server from DigitalOcean, you can select a server with CapRover one-click app and everything will be installed for you automatically. Otherwise, you can install Docker CE by following [this instruction](https://docs.docker.com/engine/installation). Note that your Docker version needs to be, at least, version 25.x+.

**AVOID snap installation**[snap installation of Docker is buggy](https://github.com/caprover/caprover/issues/501#issuecomment-554764942). Use the official installation instructions for Docker.

#### B4) Configure Firewall

Some server providers have strict firewall settings. To disable firewall on Ubuntu:

```
ufw allow 80,443,3000,996,7946,4789,2377/tcp; ufw allow 7946,4789,2377/udp;
```

See [firewall settings](https://caprover.com/docs/firewall.html) if you need more details.

CapRover Setup
--------------

Step 1: CapRover Installation
-----------------------------

Just run the following line, sit back and enjoy!

```
docker run -p 80:80 -p 443:443 -p 3000:3000 -e ACCEPTED_TERMS=true -v /var/run/docker.sock:/var/run/docker.sock -v /captain:/captain caprover/caprover
```

NOTE: do not change the port mappings. CapRover only works on the specified ports.

You will see a bunch of outputs on your screen. Once the CapRover is initialized, you can visit `http://[IP_OF_YOUR_SERVER]:3000` in your browser and login to CapRover using the default password `captain42`. You can change your password later. **However, do not make any changes in the dashboard**. We'll use the command line tool to setup the server (recommended).

Step 2: Connect Root Domain
---------------------------

Let's say you own `mydomain.com`. You can set `*.something.mydomain.com` as an `A-record` in your DNS settings to point to the IP address of the server where you installed CapRover. Note that it can take several hours for this change to take into effect. It will show up like this in your DNS configs:

*   **TYPE**: A record
*   **HOST**: `*.something`
*   **POINTS TO**: (IP Address of your server)
*   **TTL**: (doesn't really matter)

To confirm, go to [https://mxtoolbox.com/DNSLookup.aspx](https://mxtoolbox.com/DNSLookup.aspx) and enter `randomthing123.something.mydomain.com` and check if IP address resolves to the IP you set in your DNS. Note that `randomthing123` is needed because you set a wildcard entry in your DNS by setting `*.something` as your host, not `something`.

> **NOTE**: CapRover requires A Record to be pointing to CapRover's IP Address. If you use proxy services, such as Cloudflare, you may face difficulties. CapRover does not officially support such use cases.

Step 3: Configure and initialize CapRover
-----------------------------------------

### With CLI (recommended)

Assuming you have npm installed on your local machine (e.g., your laptop), simply run (add `sudo` if needed):

```
npm install -g caprover
```

Then, run

```
caprover serversetup
```

Follow the steps and login to your CapRover instance. When prompted to enter the root domain, enter `something.mydomain.com` assuming that you set `*.something.mydomain.com` to point to your IP address in step #2. Now you can access your CapRover from `captain.something.mydomain.com`. You can read more about hiding the root domain [here](https://caprover.com/docs/best-practices.html#hidden-root-domain).

> **NOTE**: **It will not be possible to carry through with the `caprover serversetup` if you've already forced https on your CapRover instance.** In such case go straight to logging in with the `caprover login` command. To change the password go to the settings menu in the app.

### With the web interface (doesn't require npm)

1.   Login to `http://[IP_OF_YOUR_SERVER]:3000`
2.   Configure the root domain
3.   Enable HTTPS, then force it
4.   Once you are connected through HTTPS, change the default password (`captain42`)

Step 4: (Optional) Set up Swap file
-----------------------------------

In some cases you may run into problems due to not having enough physical RAM. For example, when building a Docker image, if it starts to take up too much memory, the build will fail. To work around these problems (without purchasing more RAM) you can set up a Swap file (which is used as virtual RAM), by following these instructions on [How To Create A Linux Swap File](https://linuxize.com/post/create-a-linux-swap-file/).

Step 5: Deploy the Test App
---------------------------

Go to the CapRover in your browser, from the left menu select Apps and create a new app. Name it `my-first-app`. Then, download any of the test apps [here](https://github.com/caprover/caprover/tree/master/captain-sample-apps), unzip the content. and while inside the directory of the test app, run:

```
/home/Desktop/captain-examples/captain-node$  caprover deploy
```

Follow the instructions, enter `my-first-app` when asked for app name. First time build takes about two minutes. After build is completed, visit `my-first-app.something.mydomain.com` where `something.mydomain.com` is your root domain. CONGRATS! Your app is live!!

You can connect multiple custom domains (like `www.my-app.com`) to a single app and enable HTTPS and do much more in the app's settings page.

Note that when you run `caprover deploy`, the current git commit will be sent over to your server.

> **IMPORTANT**: Uncommitted files and files in `gitignore` WILL NOT be sent to the server.

You can visit CapRover in the browser and set custom parameters for your app such as environment variables, and do much more! For more details regarding deployment, please see [CLI docs](https://caprover.com/docs/cli-commands.html). For details on `captain-definition` file, see [Captain Definition File](https://caprover.com/docs/captain-definition-file.html).

---


# Crawl Statistics

- **Source:** https://caprover.com/docs/get-started.html
- **Depth:** 3
- **Pages processed:** 1
- **Crawl method:** api
- **Duration:** 2.46 seconds
- **Crawl completed:** 2/26/2026, 8:52:48 PM

# Source: https://caprover.com/docs/service-update-override.html

## URL: https://caprover.com/docs/service-update-override.html

Title: Service Update Override · CapRover

URL Source: https://caprover.com/docs/service-update-override.html

Markdown Content:
**Available as of v1.8.0**

Although [pre-deploy script](https://caprover.com/docs/pre-deploy-script.html) provides a great power for customization of the service, sometimes, it has too much power for what you need to do.

For example, Docker allows you to define read-only volumes, or UDP only port mapping, and many other customization flags through [docker update command](https://docs.docker.com/engine/reference/commandline/service_update/). Not all of these flags are ported over to CapRover as they are rarely used. Nevertheless, there are situations where you want to use some of these flags. For these cases, you can define a service override JSON or YAML content.

Every time you deploy a new version, or you change a configuration parameter in the app, your service goes through an update process:

1.   CapRover updates the fields that are explicitly set on CapRover UI (env vars, instance count and etc).
2.   If "Service Update Override" is present, CapRover overrides the result from the previous step with the override content.
3.   If "Pre-deploy script" is present, CapRover runs the pre-deploy script.
4.   The result from the previous 3 steps is then passed to the Docker API so that Docker can update the service under the hood.

Schema
------

For the "Service Update Override", you can use both yaml and JSON. The schema needs to match [Service Update Object](https://docs.docker.com/reference/api/engine/version/v1.43/#tag/Service/operation/ServiceUpdate) in Docker API. In YAML format, it'll be something like the following YAML. Note that this is just a partial example, there are many more customization parameter available.

```
TaskTemplate:
  ContainerSpec:
    Labels:
      some.label: some.value
    Image: busybox
    Command:
      - ./mycommand.sh
    Hostname: my.domain.com
    CapabilityAdd:
      - CAP_NET_ADMIN
    DNSConfig:
      Nameservers:
         - 8.8.8.8 
         - 8.8.4.4 
    Mounts:
      - Type: bind
        Source: /host/directory
        Target: /some/path/in/container
        ReadOnly: true
    Args:
      - top
  Resources:
    Limits:
      MemoryBytes: 104857600
      NanoCPUs: 2000000000
    Reservations:
      MemoryBytes: 104857600
      NanoCPUs: 2000000000
  RestartPolicy:
    Condition: any
    MaxAttempts: 0
  Placement:
    Constraints:
      - node.id==2ivku8v2gvtg4
  Networks:
    - Target: captain-overlay-network
  LogDriver:
    Name: json-file
    Options:
      max-size: 512m
  ForceUpdate: 0
Mode:
  Replicated:
    Replicas: 1
UpdateConfig:
  Parallelism: 2
  Delay: 1000000000
  FailureAction: pause
  Monitor: 15000000000
  MaxFailureRatio: 0.15
  Order: start-first
RollbackConfig:
  Parallelism: 1
  Delay: 1000000000
  FailureAction: pause
  Monitor: 15000000000
  MaxFailureRatio: 0.15
  Order: start-first
EndpointSpec:
  Mode: vip
  Ports:
    - Name: something
      Protocol: tcp
      TargetPort: 80
      PublishedPort: 8080
      PublishMode: host
```

Sample Use Cases
----------------

One common use case is to limit the resource usage by a particular service. In that case, you can do something like:

```
TaskTemplate:
  Resources:
    Limits:
      MemoryBytes:  104857600
      NanoCPUs: 2000000000
```

This will impose a limit of 2 CPUs and 100MB RAM usage on your service. You can confirm this by running

```
docker service inspect srv-captain--your-app-name --pretty
```

Another use case is when you want to customize the command:

```
TaskTemplate:
  ContainerSpec:
    Command: "./mycommand.sh"
```

If your container need some CAP_ADD added to the docker service, you can go as follow:

```
TaskTemplate:
  ContainerSpec:
    CapabilityAdd:
      - CAP_SYS_ADMIN
      - CAP_NET_ADMIN
```

Revert to Default
-----------------

One important note is that CapRover does NOT modify any existing flags that it doesn't control. Flags that CapRover controls are: env vars, ports, image, and a few others.

If you override a property that is not controlled by CapRover, like the CPU limit in above, even if you delete the override, the config won't be reverted. This is because it has already been set in Docker engine.

So instead of removing the override, change the override to another value, and then remove it. For example, if you want to remove the limitation on CPU and RAM:

*   First, set it to a high value, for example, RAM to 50GB and CPU to 20 CPUs
*   Then, you can remove the override.

Of course, alternatively, you can delete the service and create a new one.

---


# Crawl Statistics

- **Source:** https://caprover.com/docs/service-update-override.html
- **Depth:** 3
- **Pages processed:** 1
- **Crawl method:** api
- **Duration:** 8.58 seconds
- **Crawl completed:** 2/26/2026, 8:55:25 PM

