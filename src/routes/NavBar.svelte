<script lang="ts">

  import Logo from "./Logo.svelte";
  import { chats, type Chat } from "./chat";
  import { selectedChat } from "./selectedChat";
  import exportIcon from "../lib/images/export.svg";
  import importIcon from "../lib/images/import.svg";
  import Footer from "./Footer.svelte";

  let lastDeleted: Chat | null = null;

  function truncate(str: string, n: number) {
    return str.length > n ? str.slice(0, n - 1) : str;
  }

  const getJsonUpload = () => {
    return new Promise<string[]>((resolve) => {
      const inputFileElement = document.createElement("input");

      inputFileElement.setAttribute("type", "file");
      inputFileElement.setAttribute("multiple", "false");
      inputFileElement.setAttribute("accept", ".json");

      inputFileElement.addEventListener(
        "change",
        async (event) => {
          const { files } = event.target as HTMLInputElement;

          if (!files || files.length === 0) {
            return;
          }

          const filePromises = [...files].map((file) => file.text());

          resolve(await Promise.all(filePromises));
        },
        false
      );

      inputFileElement.click();
    });
  };

  function download(data: BlobPart, filename: string, type?: string) {
    console.log("Downloading...");

    let file = new Blob([data], { type: type });
    const nav = window.navigator as any;
    const finalName = `chatter__${truncate(filename, 15)
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}`;

    if (nav.msSaveOrOpenBlob) {
      // IE10
      nav.msSaveOrOpenBlob(file, finalName);
    } else {
      // Others
      let a = document.createElement("a");
      const url = URL.createObjectURL(file);

      a.href = url;
      a.download = finalName;

      document.body.appendChild(a);
      a.click();

      setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }
  }
</script>

<div class="navbar">
  <nav>
    <Logo />

    <div class="chat-button-cont">
      <button
        class="main-chat-button"
        on:click={() => {
          const emptyChatIndex = $chats.findIndex((e) => e.messages.length === 0);

          if (emptyChatIndex >= 0) {
            $selectedChat = emptyChatIndex;

            return;
          }

          $chats = $chats.concat({
            messages: [],
            timestamp: Date.now().toString(),
            title: "Empty chat",
          });

          $selectedChat = $chats.length - 1;
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

      <div style="width: 1rem;" />

      <button
        class="main-chat-button"
        on:click={async () => {
          try {
            const [content] = await getJsonUpload();

            if (content.trim() === "") return;

            const parsed = JSON.parse(content);

            $chats = $chats.concat(parsed);
          } catch (error) {
            console.error({ message: "Failed to import", error: error });
          }
        }}
      >
        <img src={importIcon} alt="Import" />
        <div style="width: 1ch;" />
        Import
      </button>
    </div>

    <div style="width: 100%; height: 2px; background-color: rgb(255, 255, 255, 0.1); margin: 2ch 0;"></div>

    {#each $chats as { title }, index}
      <div class="chat-button-cont">
        <button
          class="chat-button"
          class:selected-chat={$selectedChat === index}
          on:click={() => {
            $selectedChat = index;
          }}
        >
          <span>{title}</span>
        </button>

        {#if $chats[index].messages.length > 0}
          <button
            class="chat-button-action delete"
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
              }

              $selectedChat = 0;

              $chats = $chats;

              console.log({ message: "Deleted", content: lastDeleted });
            }}
          >
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"
              ><path
                d="M7 7h18v22H7zM3 7h26M13 3h6M13 12v10M19 12v10"
                fill="none"
                stroke="#ffffff"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2px"
                class="stroke-000000"
              /></svg
            >
          </button>

          <button
            class="chat-button-action export"
            on:click={() =>
              download(
                JSON.stringify($chats[$selectedChat]),
                $chats[$selectedChat].title,
                "application/json"
              )}
          >
            <img src={exportIcon} alt="Export" />
          </button>
        {/if}
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
        <div style="width: 1ch;" />
        <i>"{lastDeleted.title}"</i>
      </button>
    {/if}
  </nav>

  <Footer />
</div>

<style lang="scss">
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

  .main-chat-button {
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

  .main-chat-button > img {
    opacity: 0.4;
    width: 16px;
    height: 16px;
    filter: invert(0%);
    -webkit-filter: invert(0%);
  }

  .chat-button-cont {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .chat-button-action {
    background: none;
    border: none;
    width: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.5rem;
    margin-top: 0.5rem;
    opacity: 0.5;
    transition: all 200ms ease-out;
  }

  .chat-button-action:hover {
    opacity: 1;
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
  .main-chat-button:hover {
    color: black;
    background-color: white;
  }

  .main-chat-button:hover {
    border: 1.5px solid white;
  }

  .main-chat-button:hover > img {
    filter: invert(100%);
    -webkit-filter: invert(100%);
    opacity: 1;
  }

  .selected-chat {
    color: white;
  }

  nav {
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 90vh;
  }
</style>
