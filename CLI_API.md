## Info
Specific app   - `app.cake4.dev1.sandbox.loc`
IDE            - `ide.cake4.dev1.sandbox.loc`
Adminer        - `adminer.cake4.dev1.sandbox.loc`

Docker stack   - `dev1_cake4_app`
Docker network - `dev1_cake4_app_default`

## Tech Stack
We will heavily use the Wodby based docker4something architecture.
E.a: `.env`, `docker.md`, `docker-compose.yml`.

**Traefik** 
Used to map browser request with particular docker container.

**Let's Encrypt**
To secure your communication between opened to the world containers

**Coder server**
Used to write code right in your browser

**Ansible**
Used is to automate host provisioning 
and generating `.env`, `docker-compose.yml` files from templates

## Types of APIs
1. Interaction with OS using Ansible: create user, create dir, templating
Basically because I don't won't to deal with checks, if user exists, if folder exists, so on.

2. Interaction with Docker:
dc up, dc down, dc traefik up (down), etc...
  
```shell script
sandbox adduser dev1
```
```
Enter developer name:
○ dev1
● custom: __dev2
```

```
🕙 Creating user home
🕙 Generating SSH key
🕙 Creating Projects dir
```

```shell script
sandbox run dev1_cake4
sandbox run dev1
sandbox run

```
```
Select developer:
○ dev1
● dev2
```
```
Select sandbox:
○ dev1_cake4
○ dev1_aios
● dev1_drupal8
```

```shell script
sandbox new dev1 testsnd
```
```
🕙 Creating app folder
🕙 Cloning app folder
🕙 Setting up dev stack
- services list
- app index path
- services variables
🕙 Generating list of web servises for the hosts file 
```

pkg -t node10-macos-x64,node10-win-x64  --out-path=./compiled_bin/ .

sandbox
> sandbox@1.2.3
> Fetching
  fetched
>


docker-compose up -d --force-recreate --no-deps nginx
