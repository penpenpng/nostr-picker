import { NostrFetcher, type NostrEvent } from "nostr-fetch";
import { writable, derived } from "svelte/store";
import { bech32encode } from "./bech32";

const fetcher = new NostrFetcher();
const FETCH_COUNT = 300;
const RELAYS = ["wss://relay-jp.nostr.wirednet.jp"];

interface LikedPost {
  id: string;
  pubkey: string;
  content: string;
  datetime: string;
}

interface Profile {
  name: string;
  picture: string;
  createdAt: number;
}

const toLikedPost = (ev: NostrEvent): LikedPost => ({
  ...ev,
  datetime: new Date(ev.created_at * 1000).toLocaleString(),
});
const getLikedPostIds = (likeEvents: NostrEvent[]): string[] => {
  const ids = likeEvents.flatMap((ev) =>
    ev.tags.flatMap(([tag, id]) => (tag === "e" ? [id] : []))
  );
  return [...new Set(ids)];
};

function createStore() {
  const postsStore = writable<LikedPost[]>([]);
  const profilesStore = writable<Record<string, Profile>>({});
  const { subscribe } = derived(
    [postsStore, profilesStore],
    ([posts, profiles]) => ({
      posts,
      profiles,
    })
  );

  const fetch = async (pubkey: string) => {
    fetcher.shutdown();
    postsStore.set([]);
    profilesStore.set({});

    const likeEvents = await fetcher.fetchLatestEvents(
      RELAYS,
      [{ kinds: [7], authors: [bech32encode(pubkey)] }],
      FETCH_COUNT
    );
    const posts = await fetcher
      .fetchAllEvents(
        RELAYS,
        [{ ids: getLikedPostIds(likeEvents) }],
        {},
        { sort: true }
      )
      .then((data) => data.map(toLikedPost));

    postsStore.set(posts);

    const authors = [...new Set(posts.map((e) => e.pubkey))];
    const profiles: Record<string, Profile> = {};
    const iter = fetcher.allEventsIterator(
      RELAYS,
      [{ kinds: [0], authors }],
      {}
    );
    for await (const { pubkey, content, created_at: createdAt } of await iter) {
      const profile = profiles[pubkey];

      if (!profile || profile.createdAt < createdAt) {
        try {
          const { name, picture } = JSON.parse(content);
          profiles[pubkey] = { createdAt, name, picture };
          profilesStore.set(profiles);
        } catch {}
      }
    }
  };

  return {
    subscribe,
    fetch,
  };
}

export const store = createStore();
