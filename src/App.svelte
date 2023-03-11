<script lang="ts">
  import { store } from "./lib/store";

  let pubkey =
    "npub133vj8ycevdle0cq8mtgddq0xtn34kxkwxvak983dx0u5vhqnycyqj6tcza";
  let selected: string[] = [];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(selected.join("\n"));
  };
</script>

<main>
  <div>
    <input type="text" bind:value={pubkey} placeholder="npub1..." />
    <button on:click={() => store.fetch(pubkey)}
      >Fetch recent your liked posts</button
    >
  </div>
  {#if $store.posts.length > 0}
    <button on:click={copyToClipboard}
      >Copy selected posts' IDs to clipboard</button
    >
  {/if}

  <hr />

  {#each $store.posts as post (post.id)}
    <label class:selected={selected.includes(post.id)}>
      <input
        type="checkbox"
        name="selected"
        bind:group={selected}
        value={post.id}
        hidden
      />
      <div class="header">
        <img
          class="avatar"
          src={$store.profiles[post.pubkey]?.picture}
          alt=""
          width="36"
          height="36"
        />
        <div>
          <span
            class="username"
            class:loaded={$store.profiles[post.pubkey]?.name}
          >
            {$store.profiles[post.pubkey]?.name ||
              `${post.pubkey.slice(0, 10)}...`}
          </span>
          <div class="datetime">{post.datetime}</div>
        </div>
      </div>
      <div class="content">{post.content}</div>
    </label>
  {/each}
</main>

<style>
  hr {
    margin: 20px 0;
  }

  label {
    display: block;
    padding: 10px;
    margin: 5px;
    border: solid 1px lightgray;
    cursor: pointer;
  }
  label:hover {
    background-color: rgb(243, 239, 247);
  }
  label:active {
    background-color: rgb(210, 194, 228);
  }
  label.selected {
    background-color: rgb(218, 205, 233);
  }

  .header {
    display: flex;
    align-items: center;
  }
  .avatar {
    margin-right: 10px;
  }

  .username {
    font-weight: bold;
  }
  .username:not(.loaded) {
    font-weight: normal;
    font-size: 0.8rem;
    color: dimgray;
  }
  .datetime {
    color: dimgray;
    font-size: 0.95rem;
  }

  .content {
    margin-top: 10px;
    margin-left: 10px;
    white-space: pre-line;
  }
</style>
