<script lang="ts">
  import { store } from "./lib/store";

  let pubkey = "";
  let selected: string[] = [];
  let errorMessage = "";
  let loading = false;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(selected.join("\n"));
  };
  const fetch = async () => {
    try {
      loading = true;
      await store.fetch(pubkey);
      errorMessage = "";
    } catch {
      errorMessage = "something went wrong";
    } finally {
      loading = false;
    }
  };
</script>

<main>
  <div>
    <input
      type="text"
      bind:value={pubkey}
      placeholder="npub1..."
      on:input={() => (errorMessage = "")}
    />
    <button on:click={fetch}>Fetch recent your liked posts</button>
  </div>
  {#if errorMessage}
    <small class="error-message">{errorMessage}</small>
  {/if}
  {#if $store.posts.length > 0}
    <button on:click={copyToClipboard}
      >Copy selected posts' IDs to clipboard</button
    >
  {/if}

  <hr />

  {#if loading && $store.posts.length <= 0}
    loading...
  {/if}

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
  .error-message {
    color: red;
  }

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
