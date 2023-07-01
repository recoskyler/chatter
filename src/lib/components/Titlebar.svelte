<script lang="ts">
  import { chats } from "writables/chat";
  import { selectedChat } from "writables/selectedChat";

  let titleEditing: boolean = false;
</script>

<div class="titlebar">
  <div class="titlebar-items">
    {#if titleEditing}
      <input
        type="text"
        maxlength={255}
        id="chat-title-input"
        bind:value={$chats[$selectedChat].title}
      />

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
        on:keydown={() => {}}
        on:click={() => {
          titleEditing = !titleEditing;
        }}
        class="title-action"
        role="checkbox"
        tabindex={3}
        aria-checked={true}
      >
        <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
        <path
          d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
        />
      </svg>
    {:else}
      <span id="chat-title" class:hidden={titleEditing}>
        {$chats[$selectedChat].title}
      </span>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        on:keydown={() => {}}
        on:click={() => {
          titleEditing = !titleEditing;
        }}
        class="title-action"
        role="checkbox"
        tabindex={3}
        aria-checked={false}
      >
        <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
        <path
          d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"
        />
      </svg>
    {/if}
  </div>
</div>

<style lang="scss">
  .titlebar {
    color: rgba(255, 255, 255, 0.6);
    background-color: var(--color-bg-1);
    font-weight: 600;
    position: fixed;
    z-index: 200;
    width: clamp(-54ch + 100vw, -39ch + 100vw, -24ch + 100vw);
    top: 0;
    right: 0;
  }

  .titlebar-items {
    display: flex;
    padding: 1.5rem 2rem;
    justify-content: flex-start;
    align-items: center;
  }

  .title-action {
    width: 2ch;
    fill: rgba(255, 255, 255, 0.5);
    transition: all 200ms ease-out;
    cursor: pointer;
    padding-left: 2ch;

    &:hover {
      fill: rgba(255, 255, 255, 1);
    }
  }

  #chat-title-input {
    border: none;
    outline: none;
    color: rgba(255, 255, 255, 1);
    background: none;
    font-family: var(--font-body);
    font-weight: 600;
    margin: 0;
    padding: 0;
  }
</style>
