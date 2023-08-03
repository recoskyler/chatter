# Chatter

<a href='https://ko-fi.com/recoskyler' target='_blank'><img height='35' style='border:0px;height:46px;' src='https://az743702.vo.msecnd.net/cdn/kofi3.png?v=0' border='0' alt='Buy Me a Coffee at ko-fi.com'></a>

<img src="https://raw.githubusercontent.com/recoskyler/chatter/main/static/favicon.png" alt="logo" width="100" height="100">

A simple, free, and open-source OpenAI ChatGPT client with multi-account support.

You can either [self-host it](#deployment), or [start using it now](https://chatter.recoskyler.com)!

![Chatter screenshot](screenshot.png)

## Features

### Multi-chat support

You can create up to 100 chats (can be configured in `.env` in case of self-hosting).

### Multi-account support

You can have up to 25 accounts (API keys with corresponding [chat model](#supported-models)) defined, and switch between accounts on the fly. Each account can use a different [ChatGPT model](#supported-models), and each chat can use a different account.

This is very useful in the case of having a personal, and a business OpenAI account, each having their distinct API keys.

**Chatter does not come with ant warranty/liability. API keys are stored as plain text in the database and it is your responsibility to set appropriate [usage limits](https://platform.openai.com/account/billing/limits).**

### Toggle prompt/remember support

You can enable/disable remembering of the previous prompts. If enabled, previous prompts in the chat will also be submitted alongside the latest prompt.

**Keep in mind, enabling the remember option will cost more tokens.**

You can also toggle each prompt on/off if the remember option is enabled. This will allow you to submit/not submit selected prompts in order to fine-tune the response from ChatGPT.

### Light/Dark themes

*Does this even need an explanation?*

### Supported models

- ChatGPT 3.5 Turbo (**default**)
- ChatGPT 3.5 Turbo (16K tokens)
- ChatGPT 4
- ChatGPT 4 (32K tokens)

## FAQ

### What is a "system prompt"?

> A system prompt in any version of GPT refers to the initial instruction or input provided to guide the model's response generation. It establishes the context and provides guidelines or instructions for the desired output. The system prompt can help shape the behavior, tone, style, or topic of the generated response by influencing the AI model's decision-making process.

### What does the "remember" toggle do?

The remember toggle allows Chatter to **remember** previous prompts and their respective answers by submitting the previous prompts alongside the last prompt you have entered. If disabled, ChatGPT will not remember any previous topics talked about in the chat.

**Remember function only remembers the content of the current chat, not all chats**

### I found a bug/issue, what should I do?

Please create a new issue [here](https://github.com/recoskyler/chatter/issues/new?assignees=&labels=&projects=&template=bug_report.md&title=). Please include an explanation of the issue, a screenshot (if possible), console logs (access them by pressing <kbd>F12</kbd>, then selecting the **Console** tab), steps to reproduce the issue, your platform information (such as desktop/mobile, browser name and version, operating system and version, etc.), and other required fields in the template.

*Please check out [CONTRIBUTING](#contributing) section for more information*

### I have a feature request, what should I do?

Please create a new issue [here](https://github.com/recoskyler/chatter/issues/new?assignees=&labels=&projects=&template=feature_request.md&title=). Please include an explanation of your feature request and fill out the required fields in the template.

*Please check out [CONTRIBUTING](#contributing) section for more information*

## Status

**Currently in stable stage.** This project will receive updates if it proves itself to be useful. Please use the [main](/recoskyler/chatter/tree/main) branch for the stable version.

- [X] Multi-chat
- [X] Multi-account
- [X] Delete/Restore chat
- [X] ~~Import/Export chat~~
- [X] Toggle prompt
- [X] Remember toggle (remember previous prompts/send only the last prompt)
- [X] ~~Local storage~~
- [X] Dockerization
- [X] Database storage
- [X] Mobile layout
- [X] Code formatting
- [X] Themes
- [X] Analytics ([umami](https://umami.is))
- [ ] Bug monitoring ([Sentry](https://sentry.io/welcome/))
- [ ] Server monitoring ([Prometheus](https://prometheus.io/) + [Grafana](https://grafana.com/))
- [ ] Transparent Data Encryption
- [ ] I18N (maybe)

## Tech Stack

- [SvelteKit 4](https://kit.svelte.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [PostgreSQL](https://www.postgresql.org/)
- [Lucia Auth v2](https://lucia-auth.com/)
- [Skeleton](https://www.skeleton.dev/)/[Tailwind CSS](https://tailwindcss.com/)
- [Umami](https://umami.is)

## [Contributing](https://github.com/recoskyler/chatter/blob/main/CONTRIBUTING.md)

Please check out the full guide [here](https://github.com/recoskyler/chatter/blob/main/CONTRIBUTING.md).

## Development

### Requirements

- Node ^18
- NPM/PNPM
- Vite
- PM2 (*for deployment*)
- Nginx (*for deployment*)

### Setup

1. Clone the repository `git clone https://github.com/recoskyler/chatter`
2. Go into the repository directory `cd chatter`
3. Create your `.env` file `cp sample.env .env`
4. Open the `.env` file and set your environment variables. Save when you are done editing.
5. Install the dependencies `npm i`
6. Generate migrations `npm run generate`. Migrations will automatically run when you start the app.

### Running

The following command will run the database as a Docker container.

```bash
$ docker compose up -d
```

If you have the database set up already, and you would like the hot-reload to work:

```bash
npm run dev -- --open
```

When you run the app using the command above, it should open the app automatically on the default browser. You can also access it through [http://127.0.0.1:5173](http://127.0.0.1:5173) if it does not open.

## Deployment

### Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

### Starting the server

1. Install [PM2](https://pm2.keymetrics.io/) using `npm i -g pm2`
2. Update the environment variables in `ecosystem.config.cjs`
3. Start the app using the command `pm2 start ecosystem.config.cjs`

### Configuring nginx

You may also use any other web server such as [Apache2](https://httpd.apache.org/)

1. [Install nginx](https://nginx.org/en/docs/install.html)
2. Unlink the default site if you haven't already:

    ```bash
    unlink /etc/nginx/sites-enabled/default
    ```

3. Create a new nginx configuration file. Change the `HOSTNAME`, `USER`, and `PORT` according to your own configuration. Press <kbd>Ctrl + X</kbd> and then <kbd>Y</kbd> to save and exit.

    ```bash
    nano /etc/nginx/sites-available/chatter
    ```

    ```nginx
    # /etc/nginx/sites-available/chatter

    server {
        server_name HOSTNAME;

        add_header X-Frame-Options SAMEORIGIN always;

        error_log /home/USER/logs/error.log warn;
        access_log /home/USER/logs/access.log combined;

        location / {
            proxy_set_header X-Forwarded-For $remote_addr;
            proxy_set_header Host $host;
            add_header Access-Control-Allow-Origin *;
            proxy_buffering off;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
            proxy_pass http://127.0.0.1:PORT/;
        }
    }
    ```

4. Test the configuration using the following command:

    ```bash
    nginx -t
    ```

5. Enable the site using the following command:

    ```bash
    link -s /etc/nginx/sites-available/chatter /etc/nginx/sites-enabled
    ```

6. Restart nginx using the following command:

    ```bash
    systemctl restart nginx.service
    ```

## About

By [recoskyler](https://github.com/recoskyler) - 2023

### Why tho?

This was a fun project for me to learn about SvelteKit, Drizzle, TailwindCSS, and many more dev-ops related subjects. I decided to make it simple, and release it to the public as my father and some of my friends have shown interest in it.

### Legal

- [Disclaimer](https://chatter.recoskyler.com/disclaimer)
- [Cookie Policy](https://chatter.recoskyler.com/cookie)
- [Privacy Policy](https://chatter.recoskyler.com/privacy)

### License

Chatter is licensed under [GNU Affero General Public License v3.0](https://github.com/recoskyler/chatter/blob/main/LICENSE)
