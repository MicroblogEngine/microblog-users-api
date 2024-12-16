interface User {
  id: number,
  name: string,
  email: string,
  gender: string,
  address: string,
  favouriteAnime: string | null
}

export const fakeUsers: User[] = [
  {
    id: 1,
    name: "Sarthak Roy",
    email: "sarthakroy2003@gmail.com",
    gender: "male",
    address: "Kolkata, India",
    favouriteAnime: "A Silent Voice",
  },
  {
    id: 2,
    name: "John McNormie",
    email: "john@gmail.com",
    gender: "other",
    address: "Seattle, USA",
    favouriteAnime: null,
  },
  {
    id: 3,
    name: "John Doe",
    email: "doe@gmai.com",
    gender: "male",
    address: "Springfield, USA",
    favouriteAnime: "Naruto",
  },
];