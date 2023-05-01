<script lang="ts">
  import axios from "axios";
  import { chats, type Chat, type Prompt, type Role } from "./chat";
  import Header from "./Header.svelte";
  import { v4 as uuidv4 } from "uuid";
  import { selectedChat } from "./selectedChat";
  import Titlebar from "./Titlebar.svelte";
  import { trimToLength } from "../helper";

  let prompt: string = "";
  let lastPrompt: number | null = null;
  let remember: boolean = false;

  if ($chats.length === 0) {
    $chats = [
      {
        messages: [],
        timestamp: Date.now().toString(),
        title: "Empty chat",
      },
    ];
  }

  async function submitPrompt(regenerate: boolean = false) {
    if (lastPrompt !== null && Math.abs((Date.now() - lastPrompt) / 1000) < 3) {
      console.warn("Timed out");

      return;
    }

    if (prompt.trim() === "" && !regenerate) return;

    let currentRole: Role = "user";

    if ($chats[$selectedChat].messages.length === 0) {
      currentRole = "system";

      $chats[$selectedChat].title =
        prompt.trim() === "" ? "New chat" : trimToLength(prompt, 255);
    }

    if (!regenerate) {
      $chats[$selectedChat].messages = $chats[$selectedChat].messages.concat(
        {
          uuid: uuidv4(),
          content: prompt.trim(),
          role: currentRole,
          isSuccessful: true,
          timestamp: Date.now().toString(),
          isBusy: false,
          isDeleted: false,
        }

        // TODO DEBUG Uncomment

        // {
        //   uuid: uuidv4(),
        //   content: "Sphinx of black quartz, judge my vow.",
        //   role: "assistant",
        //   isSuccessful: true,
        //   timestamp: Date.now().toString(),
        //   isBusy: false,
        //   isDeleted: false,
        // }
      );
    }

    prompt = "";

    const inputBox = document.getElementById(
      "prompt-input"
    ) as HTMLTextAreaElement;

    if (inputBox !== null) {
      inputBox.value = "";
    }

    // Debug

    // $chats = $chats;

    // return;

    /////

    const body = {
      model: import.meta.env.VITE_MODEL,
      messages: remember
        ? $chats[$selectedChat].messages
            .filter((e) => !e.isDeleted)
            .map((e: Prompt) => ({
              role: e.role,
              content: e.content,
            }))
        : $chats[$selectedChat].messages.slice(-1).map((e: Prompt) => ({
            role: e.role,
            content: e.content,
          })),
    };

    const key = import.meta.env.VITE_API_KEY;
    const postUUID = uuidv4();

    try {
      $chats[$selectedChat].messages = $chats[$selectedChat].messages.concat({
        uuid: postUUID,
        content: "Loading...",
        role: "assistant",
        isSuccessful: false,
        isBusy: true,
        timestamp: Date.now().toString(),
        isDeleted: false,
      });

      const res = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        body,
        {
          headers: {
            Authorization: `Bearer ${key}`,
          },
        }
      );

      lastPrompt = Date.now();

      if (res.status !== 200) console.error(res);

      $chats[$selectedChat].messages = $chats[$selectedChat].messages.filter(
        (e) => e.uuid !== postUUID
      );

      $chats[$selectedChat].messages = $chats[$selectedChat].messages.concat({
        uuid: postUUID,
        content: res.data["choices"][0]["message"]["content"],
        role: res.data["choices"][0]["message"]["role"],
        isSuccessful: true,
        timestamp: Date.now().toString(),
        isBusy: false,
        isDeleted: false,
      });

      $chats = $chats;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error);
      } else {
        console.error(error);
      }

      $chats[$selectedChat].messages = $chats[$selectedChat].messages.filter(
        (e) => e.uuid !== postUUID
      );

      $chats[$selectedChat].messages = $chats[$selectedChat].messages.concat({
        uuid: postUUID,
        content: "Failed",
        role: "assistant",
        isSuccessful: false,
        timestamp: Date.now().toString(),
        isBusy: false,
        isDeleted: false,
      });

      $chats = $chats;
    }
  }
</script>

<svelte:head>
  <title>Chatter</title>
  <meta name="description" content="Self-hosted OpenAI Chat-GPT Client" />
</svelte:head>

<main>
  <Titlebar />

  <div class="main-cont">
    <div class="chat-parent">
      <div class="chat-cont" id="chat-cont">
        {#if $chats[$selectedChat].messages.length > 0}
          <button
            class="regen"
            on:click={() => {
              submitPrompt(true);
            }}
          >
            Regenerate Response
          </button>
        {:else}
          <p class="prompt empty-prompt-hint">
            <span> This place is emptier than my head... </span>
            <br />
            <br />
            <span>Enter a new prompt such as; </span>
            <b>"Explain quantum computing in simple terms"</b>
            <span> to start</span>
          </p>
        {/if}

        {#each $chats[$selectedChat].messages
          .slice()
          .reverse() as { role, isSuccessful, content, isBusy, isDeleted, uuid }, index}
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
                  class:deleted-prompt={isDeleted}
                >
                  <g
                    fill="none"
                    stroke="#ffffff80"
                    stroke-linejoin="round"
                    stroke-miterlimit="10"
                    stroke-width="2"
                    class="stroke-000000"
                    ><circle cx="16" cy="16" r="15" /><path
                      d="M26 27c0-5.523-4.477-10-10-10S6 21.477 6 27"
                    /><circle cx="16" cy="11" r="6" /></g
                  >
                </svg>
              {:else}
                <svg
                  viewBox="0 0 256 256"
                  xmlns="http://www.w3.org/2000/svg"
                  class:deleted-prompt={isDeleted}
                >
                  <path fill="none" d="M0 0h256v256H0z" />
                  <rect
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
                  />
                  <rect
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
                  />
                  <path
                    fill="none"
                    stroke="#ffffff80"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="12"
                    d="M148 144v40M108 144v40M128 56V16"
                    class="stroke-000000"
                  />
                  <circle
                    cx="84"
                    cy="108"
                    r="10"
                    fill="#ffffff80"
                    class="fill-000000"
                  />
                  <circle
                    cx="172"
                    cy="108"
                    r="10"
                    fill="#ffffff80"
                    class="fill-000000"
                  />
                </svg>
              {/if}
            </div>

            <pre
              class="prompt"
              class:system={role === "system"}
              class:assistant={role === "assistant"}
              class:error={!isBusy && !isSuccessful}
              class:loading={isBusy}
              class:deleted-prompt={isDeleted}
              aria-multiline="true">{content}</pre>

            <div class="prompt-actions">
              <button
                class="prompt-action"
                class:delete={!isDeleted}
                on:click={() => {
                  const promptIndex = $chats[$selectedChat].messages.findIndex(
                    (e) => e.uuid === uuid
                  );

                  if (promptIndex < 0) {
                    console.error("Could not find prompt with UUID");

                    return;
                  }

                  $chats[$selectedChat].messages[promptIndex].isDeleted =
                    !$chats[$selectedChat].messages[promptIndex].isDeleted;

                  $chats = $chats;
                }}
              >
                {#if isDeleted}
                  <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0h48v48H0z" fill="none" />
                    <path
                      d="M28 24c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4zM24 6C14.06 6 6 14.06 6 24H0l8 8 8-8h-6c0-7.73 6.27-14 14-14s14 6.27 14 14-6.27 14-14 14c-3.03 0-5.82-.97-8.12-2.61l-2.83 2.87C16.09 40.6 19.88 42 24 42c9.94 0 18-8.06 18-18S33.94 6 24 6z"
                      fill="#ffffff"
                      class="fill-000000"
                    />
                  </svg>
                {:else}
                  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M7 7h18v22H7zM3 7h26M13 3h6M13 12v10M19 12v10"
                      fill="none"
                      stroke="#ffffff"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2px"
                      class="stroke-000000"
                    />
                  </svg>
                {/if}
              </button>

              {#if isDeleted}
                <button
                  class="prompt-action"
                  class:delete={!isDeleted}
                  on:click={() => {
                    const promptIndex = $chats[
                      $selectedChat
                    ].messages.findIndex((e) => e.uuid === uuid);

                    if (promptIndex < 0) {
                      console.error("Could not find prompt with UUID");

                      return;
                    }

                    $chats[$selectedChat].messages.splice(promptIndex, 1);

                    $chats = $chats;
                  }}
                >
                  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M7 7h18v22H7zM3 7h26M13 3h6M13 12v10M19 12v10"
                      fill="none"
                      stroke="#ffffff"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2px"
                      class="stroke-000000"
                    />
                  </svg>
                </button>
              {/if}
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
              class:remembering={remember}
              on:input={(e) => (prompt = e.currentTarget.value.trim())}
              on:keyup={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
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
        <div class="hintbar">
          <div class="remember-toggle-box">
            {#if remember}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 576 512"
                class="toggle"
                fill="rgb(57, 118, 169)"
                on:click={() => {
                  remember = !remember;
                }}
                on:keyup={() => {}}
              >
                <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                <path
                  d="M192 64C86 64 0 150 0 256S86 448 192 448H384c106 0 192-86 192-192s-86-192-192-192H192zm192 96a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"
                />
              </svg>

              <span>Previous prompts will be remembered</span>
            {:else}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 576 512"
                class="toggle"
                on:click={() => {
                  remember = !remember;
                }}
                on:keyup={() => {}}
              >
                <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                <path
                  d="M384 128c70.7 0 128 57.3 128 128s-57.3 128-128 128H192c-70.7 0-128-57.3-128-128s57.3-128 128-128H384zM576 256c0-106-86-192-192-192H192C86 64 0 150 0 256S86 448 192 448H384c106 0 192-86 192-192zM192 352a96 96 0 1 0 0-192 96 96 0 1 0 0 192z"
                />
              </svg>

              <span>Only the last prompt will be submitted</span>
            {/if}
          </div>

          <span class="input-hint">
            Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to submit.
          </span>
        </div>
      </div>
    </div>
  </div>
</main>

<style lang="scss">
  $content-width: clamp(
    calc(100vw - 54ch),
    calc(100vw - 39ch),
    calc(100vw - 24ch)
  );

  .hintbar {
    display: flex;
    flex-direction: column;
    color: rgba(255, 255, 255, 0.5);
    fill: rgba(255, 255, 255, 0.5);
  }

  .remember-toggle-box {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-left: 2.5rem;
    margin-bottom: 0.5rem;
  }

  .toggle {
    width: 3ch;
    margin-right: 1ch;
    cursor: pointer;
  }

  .remembering {
    border: 2px solid rgb(57, 118, 169);
  }

  .main-cont {
    display: flex;
    position: relative;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 4rem;
    max-height: calc(100vh - 10rem);
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
    border: 2px solid rgb(92, 102, 113);
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
    overflow-x: hidden;
    overflow-y: auto;
    white-space: pre-wrap;
    white-space: -moz-pre-wrap;
    white-space: -pre-wrap;
    white-space: -o-pre-wrap;
    word-wrap: break-word;
    background: none;
    box-shadow: none;
    font-family: "Open Sans", Roboto, Helvetica, Arial;
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

  .prompt-action > svg {
    opacity: 0.5;
    transition: all 200ms ease-out;
  }

  .prompt-action:hover > svg {
    opacity: 1;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 2rem;
    width: $content-width;
    max-width: 64rem;
    margin: 0 auto;
    padding-left: clamp(20ch, 35ch, 50ch);
    box-sizing: border-box;
    max-height: 100vh;
    align-items: center;
    justify-content: center;
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

  .deleted-prompt {
    opacity: 0.4;
    text-decoration: line-through;
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

  .prompt-actions {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
</style>
