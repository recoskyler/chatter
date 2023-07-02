# Chatter

<a href='https://ko-fi.com/recoskyler' target='_blank'><img height='35' style='border:0px;height:46px;' src='https://az743702.vo.msecnd.net/cdn/kofi3.png?v=0' border='0' alt='Buy Me a Coffee at ko-fi.com'></a>

A self-hosted OpenAI ChatGPT client.

![Chatter screenshot](screenshot.webp)

## Status

**Currently in Usable stage.** This project will receive updates if it proves itself to be useful. Use the [main](/recoskyler/chatter/tree/main) branch.

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
- Node ^18
- NPM/PNPM
- Vite

## Development

### Setup

1. Clone the repository `git clone https://github.com/recoskyler/chatter`
2. Go into the repository directory `cd chatter`
3. Create your `.env` file `cp sample.env .env`
4. Open the `.env` file and set your [API KEY](https://platform.openai.com/account/api-keys), and other database related environment variables.

    ```env
    VITE_API_KEY=YOUR_API_KEY
    ```

5. Save the `.env` file
6. Install the dependencies `npm i`
7. Run the migrations using `npx prisma migrate dev`

### Running

The following command will run the app and the database as a Docker container. Your changes will not effect the app.

```bash
$ docker compose up -d

$ npx prisma migrate dev
```

or if you have a database set up already, and you would like the hot-reload to work:

```bash
npm run dev -- --open
```

### Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## About

By [recoskyler](https://github.com/recoskyler) - 2023
