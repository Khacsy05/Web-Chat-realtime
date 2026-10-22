export const STICKER_PACKS = [
  {
    id: "cuppy",
    name: "Cuppy Vui Nhộn",
    icon: "/stickers/cuppy/smile.webp",
    stickers: [
      { id: "c1", name: "Smile", url: "/stickers/cuppy/smile.webp" },
      { id: "c2", name: "LOL", url: "/stickers/cuppy/lol.webp" },
      { id: "c3", name: "ROFL", url: "/stickers/cuppy/rofl.webp" },
      { id: "c4", name: "Love", url: "/stickers/cuppy/love.webp" },
      { id: "c5", name: "Cookie", url: "/stickers/cuppy/cookie.webp" },
      { id: "c6", name: "Sad", url: "/stickers/cuppy/sad.webp" },
      { id: "c7", name: "Cry", url: "/stickers/cuppy/cry.webp" },
      { id: "c8", name: "HMM", url: "/stickers/cuppy/hmm.webp" },
      { id: "c9", name: "Angry", url: "/stickers/cuppy/angry.webp" },
      { id: "c10", name: "Tired", url: "/stickers/cuppy/tired.webp" },
      { id: "c11", name: "Work Hard", url: "/stickers/cuppy/workhard.webp" },
      { id: "c12", name: "Shine", url: "/stickers/cuppy/shine.webp" },
      { id: "c13", name: "Hi", url: "/stickers/cuppy/hi.webp" },
      { id: "c14", name: "Bye", url: "/stickers/cuppy/bye.webp" },
    ]
  },
  {
    id: "cat",
    name: "Mèo Cute Động",
    icon: "/stickers/cat/cat_cute.gif",
    stickers: [
      { id: "cat1", name: "Cat Wave", url: "/stickers/cat/cat_wave.gif" },
      { id: "cat2", name: "Cat Dance", url: "/stickers/cat/cat_dance.gif" },
      { id: "cat3", name: "Cat Love", url: "/stickers/cat/cat_love.gif" },
      { id: "cat4", name: "Cat Heart", url: "/stickers/cat/cat_heart.gif" },
      { id: "cat5", name: "Cat Typing", url: "/stickers/cat/cat_typing.gif" },
      { id: "cat6", name: "Cat Cute", url: "/stickers/cat/cat_cute.gif" },
      { id: "cat7", name: "Cat OK", url: "/stickers/cat/cat_ok.gif" },
    ]
  },
  {
    id: "pepe",
    name: "Pepe & Memes",
    icon: "/stickers/pepe/peepo_love.webp",
    stickers: [
      { id: "p1", name: "Peepo Love", url: "/stickers/pepe/peepo_love.webp" },
      { id: "p2", name: "Peepo Happy", url: "/stickers/pepe/peepo_happy.webp" },
      { id: "p3", name: "Peepo Sad", url: "/stickers/pepe/peepo_sad.webp" },
      { id: "p4", name: "Feels Good", url: "/stickers/pepe/feels_good.webp" },
      { id: "p5", name: "Feels Bad", url: "/stickers/pepe/feels_bad.webp" },
      { id: "p6", name: "MonkaS", url: "/stickers/pepe/monka_s.webp" },
      { id: "p7", name: "MonkaW", url: "/stickers/pepe/monka_w.webp" },
      { id: "p8", name: "PogChamp", url: "/stickers/pepe/pogchamp.webp" },
      { id: "p9", name: "Kappa", url: "/stickers/pepe/kappa.webp" },
      { id: "p10", name: "Hey Guys", url: "/stickers/pepe/heyguys.webp" },
      { id: "p11", name: "Fail Fish", url: "/stickers/pepe/failfish.webp" },
    ]
  },
  {
    id: "together",
    name: "Bạn Bè & Đời Sống",
    icon: "/stickers/together/sending_love.webp",
    stickers: [
      { id: "t1", name: "Sending Love", url: "/stickers/together/sending_love.webp" },
      { id: "t2", name: "Heart", url: "/stickers/together/heart.webp" },
      { id: "t3", name: "High Five", url: "/stickers/together/high_five.webp" },
      { id: "t4", name: "Stay Connected", url: "/stickers/together/connected.webp" },
      { id: "t5", name: "OK", url: "/stickers/together/ok.webp" },
      { id: "t6", name: "Stay Calm", url: "/stickers/together/stay_calm.webp" },
      { id: "t7", name: "Cat On Laptop", url: "/stickers/together/cat_laptop.webp" },
    ]
  }
];

export const findPackByStickerUrl = (url) => {
  if (!url) return null;
  const cleanUrl = url.split("?")[0];
  return STICKER_PACKS.find((pack) =>
    pack.stickers.some(
      (s) =>
        s.url === cleanUrl ||
        cleanUrl.endsWith(s.url) ||
        s.url.endsWith(cleanUrl) ||
        cleanUrl.includes(s.url)
    )
  );
};
