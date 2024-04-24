module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: "192.168.0.62",
      user: "shootingm",
      password: "iWm478*7",
      database: "shooting_management",
    },
    pool: {
      min: 2,
      max: 500,
    },
    migrations: {
      directory: "./db/migrations",
    },
    seeds: {
      directory: "./db/seeds",
    },
  },
};

