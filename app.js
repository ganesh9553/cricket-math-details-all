const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
const initiliazeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running");
    });
  } catch (e) {
    console.log(`DB ERROR: ${e.message}`);
    process.exit(1);
  }
};
initiliazeDBAndServer();

///api1
app.get("/players/", async (request, response) => {
  const getAll = `
    SELECT player_id AS playerId,player_name AS playerName
    FROM player_details
    ORDER BY player_id;`;
  const playerArray = await db.all(getAll);
  response.send(playerArray);
});

///api2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
    SELECT player_id AS playerId,player_name AS playerName
    FROM player_details
    WHERE player_id = ${playerId};`;
  const player = await db.get(getPlayer);
  response.send(player);
});

///api3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayer = `
    UPDATE player_details
    SET player_name = '${playerName}'
    WHERE player_id = ${playerId};`;
  await db.run(updatePlayer);
  response.send("Player Details Updated");
});

///api4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getPlayer = `
    SELECT match_id AS matchId,match,year
    FROM match_details
    WHERE match_id = ${matchId};`;
  const player = await db.get(getPlayer);
  response.send(player);
});
///api5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
    SELECT match_id AS matchId,match,year
    FROM player_match_score NATURAL JOIN match_details
    WHERE player_id = ${playerId};`;
  const player = await db.all(getPlayer);
  response.send(player);
});

///api6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayer = `
    SELECT player_id AS playerId,player_name AS playerName
    FROM player_details NATURAL JOIN player_match_score
    WHERE match_id = ${matchId};`;
  const player = await db.all(getPlayer);
  response.send(player);
});

//api7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScored = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId}
    GROUP BY player_details.player_id;
    `;
  const player = await db.get(getPlayerScored);
  response.send(player);
});
module.exports = app;
