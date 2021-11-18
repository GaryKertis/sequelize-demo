const Sequelize = require("sequelize");

const db = new Sequelize("postgres://localhost:5432/garydemo", {
  logging: false,
});

// not strictly necessary but validates connection
// db.authenticate().then(() => {
//   console.log("connected to the database");
// });

const Album = db.define("album", {
  title: Sequelize.STRING,
  rating: Sequelize.INTEGER,
});

Album.findBestAlbum = async function () {
  return await this.findAll({
    where: {
      rating: 5,
    },
  });
};

Album.prototype.findBestSong = async function () {
  return await this.getSongs({ where: { rating: 5 } });
};

const Song = db.define("song", {
  title: Sequelize.STRING,
  rating: Sequelize.INTEGER,
});

Song.belongsToMany(Album, { through: "song_album" });
Album.belongsToMany(Song, { through: "song_album" });

const start = async () => {
  await db.sync({ force: true });

  let nevermind = new Album({ title: "Nevermind", rating: 5 });
  await nevermind.save();

  let bestOf = new Album({ title: "Best Of", rating: 4 });
  await bestOf.save();

  let inbloom = new Song({ title: "In Bloom", rating: 5 });
  await inbloom.save();

  let polly = new Song({ title: "Polly", rating: 4 });
  await polly.save();

  await inbloom.setAlbums([nevermind, bestOf]);
  await polly.setAlbums([nevermind]);

  // Eager load example.
  let allAlbums = await Album.findAll({ include: [Song] });
  console.log("Eager loaded:", allAlbums[0].songs[0].title);

  // Instance method example.
  let bestSong = await allAlbums[0].findBestSong();
  console.log("Best songs:", bestSong[0].title);

  // Class method example.
  let bestAlbum = await Album.findBestAlbum();
  console.log("Best album:", bestAlbum[0].title);
};

start();
