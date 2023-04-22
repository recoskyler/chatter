<script lang="ts">
  import axios from "axios";
  import { chats, type Chat, type Prompt, type Role } from "./chat";
  import Header from "./Header.svelte";
  import Logo from "./Logo.svelte";
  import { json } from "@sveltejs/kit";

  const k$chatsKey = "__chatter_$chats__";

  let prompt: String = "";
  let lastPrompt: Date | null = null;
  let lastDeleted: Chat | null = null;

  if ($chats.length === 0) {
    $chats = [
      {
        messages: [],
        timestamp: Date.now().toString(),
        title: "Empty chat",
      },
    ];

    if (typeof window !== "undefined") {
      localStorage.setItem(k$chatsKey, JSON.stringify($chats));
    }
  }

  let selectedChat: number = 0;

  function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1000
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

  async function submitPrompt(regenerate: boolean = false) {
    if (
      lastPrompt !== null &&
      Math.abs((Date.now() - lastPrompt.getTime()) / 1000) < 3
    ) {
      console.warn("Timed out");

      return;
    }

    if (prompt.trim() === "" && !regenerate) return;

    let currentRole: Role = "user";

    if ($chats[selectedChat].messages.length === 0) {
      currentRole = "system";

      $chats[selectedChat].title = prompt;
    }

    if (!regenerate) {
      $chats[selectedChat].messages = $chats[selectedChat].messages.concat({
        content: prompt,
        role: currentRole,
        isSuccessful: true,
        timestamp: Date.now().toString(),
        isBusy: false,
      });
    }

    const body = {
      model: import.meta.env.VITE_MODEL,
      messages: $chats[selectedChat].messages.map((e: Prompt) => ({
        role: e.role,
        content: e.content,
      })),
    };

    console.log($chats[selectedChat].messages);

    const key = import.meta.env.VITE_API_KEY;

    try {
      $chats[selectedChat].messages = $chats[selectedChat].messages.concat({
        content: "Loading...",
        role: "assistant",
        isSuccessful: false,
        isBusy: true,
        timestamp: Date.now().toString(),
      });

      localStorage.setItem(k$chatsKey, JSON.stringify($chats));

      const res = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        body,
        {
          headers: {
            Authorization: `Bearer ${key}`,
          },
        }
      );

      if (res.status !== 200) console.error(res);

      prompt = "";

      const inputBox = document.getElementById(
        "prompt-input"
      ) as HTMLTextAreaElement;

      if (inputBox !== null) {
        inputBox.value = "";
      }

      $chats[selectedChat].messages.pop();

      $chats[selectedChat].messages = $chats[selectedChat].messages.concat({
        content: res.data["choices"][0]["message"]["content"],
        role: res.data["choices"][0]["message"]["role"],
        isSuccessful: true,
        timestamp: Date.now().toString(),
        isBusy: false,
      });

      $chats = $chats;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error);
      } else {
        console.error(error);
      }

      $chats[selectedChat].messages.pop();

      $chats[selectedChat].messages = $chats[selectedChat].messages.concat({
        content: "Failed",
        role: "assistant",
        isSuccessful: false,
        timestamp: Date.now().toString(),
        isBusy: false,
      });

      $chats = $chats;
    }

    localStorage.setItem(k$chatsKey, JSON.stringify($chats));
  }
</script>

<svelte:head>
  <title>Chatter</title>
  <meta name="description" content="Self-hosted OpenAI Chat-GPT Client" />
</svelte:head>

<div class="app">
  <Header />

  <div class="navbar">
    <nav>
      <Logo />

      <button
        class="new-chat-button"
        on:click={() => {
          const emptyChat = $chats.findIndex((e) => e.messages.length === 0);

          // if (emptyChat >= 0) {
          //   selectedChat = emptyChat;

          //   return;
          // }

          $chats = $chats.concat({
            messages: [],
            timestamp: Date.now().toString(),
            title: "Empty chat",
          });

          selectedChat = $chats.length - 1;
        }}
      >
        <svg
          stroke="currentColor"
          fill="none"
          stroke-width="2"
          viewBox="0 0 24 24"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4"
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <div style="width: 1ch;" />
        New Chat
      </button>

      {#each $chats as { title }, index}
        <div class="chat-button-cont">
          <button
            class="chat-button"
            class:selected-chat={selectedChat === index}
            on:click={() => {
              selectedChat = index;
            }}
          >
            <span>{title}</span>
          </button>

          <button
            class="chat-button-delete delete"
            on:click={() => {
              lastDeleted = $chats.splice(index, 1)[0];

              if ($chats.length === 0) {
                $chats = [
                  {
                    messages: [],
                    timestamp: Date.now().toString(),
                    title: "Empty chat",
                  },
                ];

                if (typeof window !== "undefined") {
                  localStorage.setItem(k$chatsKey, JSON.stringify($chats));
                }
              }

              selectedChat = 0;

              $chats = $chats;

              localStorage.setItem(k$chatsKey, JSON.stringify($chats));

              console.log({ message: "Deleted", content: lastDeleted });
            }}
          >
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"
              ><path
                d="M7 7h18v22H7zM3 7h26M13 3h6M13 12v10M19 12v10"
                fill="none"
                stroke="#a3a3a3"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2px"
                class="stroke-000000"
              /></svg
            >
          </button>
        </div>
      {/each}

      {#if lastDeleted !== null}
        <button
          class="chat-button undo"
          on:click={() => {
            if (lastDeleted === null) return;

            $chats = $chats.concat(lastDeleted);

            console.log({ message: "Undo delete", content: lastDeleted });

            lastDeleted = null;
          }}
        >
          Undo delete
          <div style="width: 1ch;"></div>
          <i>"{lastDeleted.title}"</i>
        </button>
      {/if}
    </nav>

    <footer>
      <progress
        id="storage"
        max="100"
        value={new TextEncoder().encode(JSON.stringify($chats)).length / 50000}
      >
        {new TextEncoder().encode(JSON.stringify($chats)).length / 50000}%
      </progress>

      <span class="storage-text">
        {formatBytes((new TextEncoder()).encode(JSON.stringify($chats)).length, 2)} of 5 MB
        <a
          target="_blank"
          href="https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria"
        >
          Local Storage</a
        > Used
      </span>

      <p>
        <span>Made with </span>

        <a href="/deniz">🫀</a>

        <span> by </span>

        <a target="_blank" href="https://github.com/recoskyler"> recoskyler </a>

        <span> — </span>

        <a target="_blank" href="https://github.com/recoskyler/chatter"> GitHub </a>
      </p>
    </footer>
  </div>

  <main>
    <div class="main-cont">
      <div class="chat-parent">
        <div class="chat-cont" id="chat-cont">
          {#if $chats[selectedChat].messages.length > 0}
            <button
              class="regen"
              on:click={() => {
                submitPrompt(true);
              }}
            >
              Regenerate Response
            </button>
          {:else}
            <span class="prompt empty-prompt-hint">
              Enter a new prompt such as; <b
                >"Explain quantum computing in simple terms"</b
              >
            </span>
            <br />
            <span class="prompt empty-prompt-hint"> Nothing here yet... </span>
          {/if}

          {#each $chats[selectedChat].messages
            .slice()
            .reverse() as { role, isSuccessful, content, isBusy }, index}
            <div class="prompt-cont">
              <div class="prompt-icon">
                {#if role === "system"}
                  <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"
                    ><g data-name="1"
                      ><path
                        d="M293.9 450h-60.37a15 15 0 0 1-14.92-13.42l-4.47-42.09a152.77 152.77 0 0 1-18.25-7.56L163 413.53a15 15 0 0 1-20-1.06l-42.69-42.69a15 15 0 0 1-1.06-20l26.61-32.93a152.15 152.15 0 0 1-7.57-18.25l-42.16-4.5a15 15 0 0 1-13.42-14.91v-60.38a15 15 0 0 1 13.42-14.91l42.09-4.47a152.15 152.15 0 0 1 7.57-18.25l-26.61-32.93a15 15 0 0 1 1.06-20l42.69-42.69a15 15 0 0 1 20-1.06l32.93 26.6a152.77 152.77 0 0 1 18.25-7.56l4.47-42.09A15 15 0 0 1 233.53 48h60.37a15 15 0 0 1 14.92 13.42l4.46 42.09a152.91 152.91 0 0 1 18.26 7.56l32.92-26.6a15 15 0 0 1 20 1.06l42.69 42.69a15 15 0 0 1 1.06 20l-26.61 32.93a153.8 153.8 0 0 1 7.57 18.25l42.09 4.47a15 15 0 0 1 13.41 14.91v60.38a15 15 0 0 1-13.37 14.94l-42.09 4.47a153.8 153.8 0 0 1-7.57 18.25l26.61 32.93a15 15 0 0 1-1.06 20l-42.69 42.72a15 15 0 0 1-20 1.06l-32.92-26.6a152.91 152.91 0 0 1-18.26 7.56l-4.46 42.09A15 15 0 0 1 293.9 450ZM247 420h33.39l4.09-38.56a15 15 0 0 1 11.06-12.91A123 123 0 0 0 325.7 356a15 15 0 0 1 17 1.31l30.16 24.37 23.61-23.61L372.06 328a15 15 0 0 1-1.31-17 122.63 122.63 0 0 0 12.49-30.14 15 15 0 0 1 12.92-11.06l38.55-4.1v-33.39l-38.55-4.1a15 15 0 0 1-12.92-11.06A122.63 122.63 0 0 0 370.75 187a15 15 0 0 1 1.31-17l24.37-30.16-23.61-23.61-30.16 24.37a15 15 0 0 1-17 1.31 123 123 0 0 0-30.14-12.49 15 15 0 0 1-11.06-12.91L280.41 78H247l-4.09 38.56a15 15 0 0 1-11.07 12.91A122.79 122.79 0 0 0 201.73 142a15 15 0 0 1-17-1.31l-30.13-24.41-23.6 23.61 24.38 30.16a15 15 0 0 1 1.3 17 123.41 123.41 0 0 0-12.49 30.14 15 15 0 0 1-12.91 11.06l-38.56 4.1v33.38l38.56 4.1a15 15 0 0 1 12.91 11.06A123.41 123.41 0 0 0 156.67 311a15 15 0 0 1-1.3 17L131 358.11l23.61 23.61 30.17-24.37a15 15 0 0 1 17-1.31 122.79 122.79 0 0 0 30.13 12.49 15 15 0 0 1 11.07 12.91Zm202.71-140.81Z"
                        fill="#ffffff80"
                        class="fill-000000"
                      /><path
                        d="M263.71 340.36A91.36 91.36 0 1 1 355.08 249a91.46 91.46 0 0 1-91.37 91.36Zm0-152.72A61.36 61.36 0 1 0 325.08 249a61.43 61.43 0 0 0-61.37-61.36Z"
                        fill="#ffffff80"
                        class="fill-000000"
                      /></g
                    ></svg
                  >
                {:else if role === "user"}
                  <svg
                    viewBox="0 0 32 32"
                    xml:space="preserve"
                    xmlns="http://www.w3.org/2000/svg"
                    ><g
                      fill="none"
                      stroke="#ffffff80"
                      stroke-linejoin="round"
                      stroke-miterlimit="10"
                      stroke-width="2"
                      class="stroke-000000"
                      ><circle cx="16" cy="16" r="15" /><path
                        d="M26 27c0-5.523-4.477-10-10-10S6 21.477 6 27"
                      /><circle cx="16" cy="11" r="6" /></g
                    ></svg
                  >
                {:else}
                  <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"
                    ><path fill="none" d="M0 0h256v256H0z" /><rect
                      fill="none"
                      height="160"
                      rx="24"
                      stroke="#ffffff80"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="12"
                      width="192"
                      x="32"
                      y="56"
                      class="stroke-000000"
                    /><rect
                      fill="none"
                      height="40"
                      rx="20"
                      stroke="#ffffff80"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="12"
                      width="112"
                      x="72"
                      y="144"
                      class="stroke-000000"
                    /><path
                      fill="none"
                      stroke="#ffffff80"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="12"
                      d="M148 144v40M108 144v40M128 56V16"
                      class="stroke-000000"
                    /><circle
                      cx="84"
                      cy="108"
                      r="10"
                      fill="#ffffff80"
                      class="fill-000000"
                    /><circle
                      cx="172"
                      cy="108"
                      r="10"
                      fill="#ffffff80"
                      class="fill-000000"
                    /></svg
                  >
                {/if}
              </div>

              <p
                class="prompt"
                class:system={role === "system"}
                class:assistant={role === "assistant"}
                class:error={!isBusy && !isSuccessful}
                class:loading={isBusy}
              >
                {content}
              </p>

              <div class="prompt-actions">
                <button
                  class="prompt-action delete"
                  on:click={() => {
                    $chats[selectedChat].messages.splice(index, 1);

                    $chats = $chats;

                    localStorage.setItem(k$chatsKey, JSON.stringify($chats));
                  }}
                >
                  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"
                    ><path
                      d="M7 7h18v22H7zM3 7h26M13 3h6M13 12v10M19 12v10"
                      fill="none"
                      stroke="#a3a3a3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2px"
                      class="stroke-000000"
                    /></svg
                  >
                </button>
              </div>
            </div>
          {/each}
        </div>

        <div class="chat-input-cont">
          <div class="chat-input-box">
            <div id="chat-form">
              <textarea
                placeholder="Enter your prompt"
                name="prompt"
                id="prompt-input"
                aria-multiline="true"
                aria-label="Prompt"
                maxlength="4096"
                on:input={(e) => (prompt = e.currentTarget.value.trim())}
                on:keyup={(e) => {
                  if (e.key === "Enter" && e.shiftKey) {
                    submitPrompt();

                    e.currentTarget.value = "";
                  }
                }}
              />

              <button class="submit" on:click={() => submitPrompt()}>
                <svg
                  viewBox="0 0 80 80"
                  xml:space="preserve"
                  xmlns="http://www.w3.org/2000/svg"
                  enable-background="new 0 0 80 80"
                >
                  <path
                    d="M40 5.4C20.9 5.4 5.4 20.9 5.4 40S20.9 74.6 40 74.6 74.6 59.1 74.6 40C74.5 20.9 59.1 5.5 40 5.4zm0 66.2C22.6 71.6 8.4 57.4 8.4 40S22.6 8.4 40 8.4 71.6 22.6 71.6 40C71.5 57.4 57.4 71.5 40 71.6z"
                    fill="#a3a3a3"
                    class="fill-000000"
                  />
                  <path
                    d="M21.4 16.5 32.2 40 21.4 63.5 63.1 40 21.4 16.5zm6.6 7.2 26.3 14.8H34.8L28 23.7zm6.8 17.8h19.5L28 56.3l6.8-14.8z"
                    fill="#a3a3a3"
                    class="fill-000000"
                  />
                </svg>
              </button>
            </div>
          </div>
          <span class="input-hint">
            Press <kbd>Shift</kbd> + <kbd>Enter</kbd> to submit.
          </span>
        </div>
      </div>
    </div>
  </main>
</div>

<style lang="scss">
  $content-width: clamp(calc(100vw - 54ch), calc(100vw - 39ch), calc(100vw - 24ch));

  .main-cont {
    display: flex;
    position: relative;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
    height: 100vh;
  }

  .chat-parent {
    display: grid;
    grid-template-columns: clamp(20ch, 70ch, 100ch);
    grid-template-rows: auto auto;
    grid-column-gap: 0px;
    grid-row-gap: 0px;
    max-height: calc(100vh - 5rem);
  }

  .chat-cont {
    grid-area: 1 / 1 / 2 / 2;
    overflow-y: auto;
    overflow-x: hidden;
    height: auto;
    display: flex;
    flex-direction: column-reverse;
    padding-right: 3ch;
  }

  .chat-input-cont {
    grid-area: 2 / 1 / 3 / 2;
    padding-top: 1ch;
  }

  .submit {
    width: 2.5rem;
    background: none;
    border: none;
    outline: none;
    cursor: pointer;
    display: flex;
    place-items: center;
    margin-left: 1ch;
  }

  .submit:hover > svg > path {
    stroke: white;
  }

  .submit > svg > path {
    stroke: rgb(148, 148, 148);
    transition: all 200ms ease-out;
  }

  #prompt-input {
    background-color: rgba(92, 102, 113, 0.448);
    border: none;
    padding: 1.5ch;
    border-radius: 6px;
    width: clamp(15ch, 50ch, 70ch);
    color: rgba(255, 255, 255, 0.8);
    resize: vertical;
    margin-bottom: 0.5rem;
  }

  #chat-form {
    display: flex;
    place-items: center;
    padding-left: 2.5rem;
  }

  .prompt {
    color: rgba(255, 255, 255, 0.6);
    padding: 0;
    margin: 0;
    margin-left: 1rem;
    width: clamp(15ch, 50ch, calc($content-width - 2ch));
  }

  .assistant {
    color: rgba(255, 255, 255, 0.8);
  }

  .system {
    color: var(--color-theme-2);
  }

  .loading {
    color: rgba(255, 255, 255, 0.5);
  }

  .error {
    color: rgba(255, 0, 0, 0.6);
  }

  .prompt-cont {
    display: flex;
    flex-direction: row;
    margin: 1rem 0;
  }

  .prompt-icon > svg {
    width: 1.5rem;
    height: 1.5rem;
    margin-top: 0.5ch;
  }

  .prompt-action {
    background: none;
    border: none;
    display: flex;
    place-content: center;
    width: 1.5rem;
    height: 1.5rem;
    margin-left: 1rem;
    margin-top: 0.5ch;
    cursor: pointer;
  }

  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .navbar {
    width: clamp(20ch, 35ch, 50ch);
    position: fixed;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 3ch 2ch;
    top: 0;
    left: 0;
    height: calc(100vh - 6ch);
    background-color: var(--color-bg-2);
  }

  .new-chat-button {
    border: 1.5px solid rgba(255, 255, 255, 0.4);
    padding: 1.5ch;
    color: rgba(255, 255, 255, 0.4);
    background: none;
    display: flex;
    border-radius: 0.7ch;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;
    transition: all 200ms ease-out;
    font-weight: 600;
    margin-top: 1rem;
    width: 100%;
    text-align: start;
    max-lines: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .chat-button {
    border: none;
    padding: 1ch 1.5ch;
    color: rgba(255, 255, 255, 0.4);
    background: none;
    display: flex;
    border-radius: 0.7ch;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;
    transition: all 200ms ease-out;
    font-weight: 600;
    margin-top: 0.5rem;
    width: 100%;
    text-align: start;
    max-lines: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .chat-button > span {
    display: block;
    width: clamp(20ch, 35ch, 50ch);
    text-align: start;
    max-lines: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .chat-button:hover,
  .new-chat-button:hover {
    color: black;
    background-color: white;
  }

  .new-chat-button:hover {
    border: 1.5px solid white;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    width: $content-width;
    max-width: 64rem;
    margin: 0 auto;
    padding-left: clamp(20ch, 35ch, 50ch);
    box-sizing: border-box;
  }

  footer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 12px;
    color: rgba(255, 255, 255, 0.7);
  }

  footer a {
    font-weight: bold;
  }

  @media (min-width: 480px) {
    footer {
      padding: 12px 0;
    }
  }

  .selected-chat {
    color: white;
  }

  .regen {
    background: none;
    border: 1.5px solid var(--color-theme-2);
    color: var(--color-theme-2);
    padding: 1ch;
    width: clamp(20ch, 28ch, 30ch);
    border-radius: 6px;
    font-size: small;
    font-weight: 600;
    margin: 2ch 2.5rem;
    transition: all 200ms ease-out;
  }

  .regen:hover {
    background-color: var(--color-theme-2);
    border: 1.5px solid var(--color-theme-2);
    color: black;
  }

  .chat-button-cont {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .chat-button-delete {
    background: none;
    border: none;
    width: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.5rem;
    margin-top: 0.5rem;
  }

  .delete > svg > path {
    transition: all 200ms ease-out;
  }

  .delete:hover > svg > path {
    stroke: rgb(255, 98, 98);
  }

  // progress {
  //   background-color: rgba(255, 255, 255, 0.4);
  //   border-radius: 1ch;
  //   height: 0.7ch;
  //   border: none;
  //   width: clamp(18ch, 32ch, 46ch);
  //   margin-bottom: 1ch;

  // }

  .storage-text {
    font-size: x-small;
    color: rgba(255, 255, 255, 0.4);
  }

  .storage-text > a {
    $color-theme-1: var(--color-theme-1);
    color: rgba($color-theme-1, 0.4);
  }

  .empty-prompt-hint {
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 10%;
    text-align: center;
  }

  .input-hint {
    font-size: x-small;
    color: rgba(255, 255, 255, 0.5);
    margin-left: 2.5rem;
  }

  kbd {
    border: 1px solid rgba(255, 255, 255, 0.4);
    padding: 0.3ch;
    border-radius: 3px;
    border-bottom-width: 3px;
  }

  nav {
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 90vh;
    padding-right: 2ch;
  }
</style>
