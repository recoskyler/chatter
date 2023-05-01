# Chatter

<a href='https://ko-fi.com/recoskyler' target='_blank'><img height='35' style='border:0px;height:46px;' src='https://az743702.vo.msecnd.net/cdn/kofi3.png?v=0' border='0' alt='Buy Me a Coffee at ko-fi.com'></a>

A self-hosted OpenAI ChatGPT client.

![Chatter screenshot](screenshot.webp)

## Status

**Currently in Usable stage.** This project will receive updates if it proves itself to be useful.

- [X] Multi chat
- [X] Delete/Restore chat
- [X] Import/Export chat
- [X] Delete/Restore prompt
- [X] Remember toggle (remember previous prompts/send only the last prompt)
- [X] Local storage
- [X] Dockerization
- [ ] Database storage
- [ ] Mobile layout
- [ ] I18N (maybe)
- [ ] Themes (maybe)

## Requirements

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/linux/)
- Node ^19.1
- NPM/PNPM
- Vite

## Setup

1. Clone the repository `git clone https://github.com/recoskyler/chatter`
2. Go into the repository directory `cd chatter`
3. Create your `.env` file `cp sample.env .env`
4. Open the `.env` file and set your [API KEY](https://platform.openai.com/account/api-keys)

    ```env
    VITE_API_KEY=YOUR_API_KEY
    VITE_MODEL=gpt-3.5-turbo
    VITE_APP_VERSION=0.0.2
    ```

5. Save the `.env` file
6. Install the dependencies `npm i`

## Running

```bash
docker compose up -d
```

or

```bash
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## About

By [recoskyler](https://github.com/recoskyler) - 2023
