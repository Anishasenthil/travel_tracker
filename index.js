import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;   

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "universe",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


async function checkVisited()
{
  const result = await db.query("SELECT country_code FROM visited_countries");
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });

  return countries;
}
// GET home page
app.get("/", async (req, res) => {
  
  
  const countries = await checkVisited();
  res.render("index.ejs", { countries: countries, total: countries.length });
  
});

app.post("/add", async (req,res) => {
const input = req.body["country"];
try{
  const result = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%' ;",[input.toLowerCase()]);
  if(result.rows.length !== 0)
  {
    const data = result.rows[0];
    const countrycode = data.country_code;
    try{
      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",[countrycode]);
      res.redirect("/");
    }catch(err){
      console.log(err);
      const countries = await checkVisited();
     res.render("index.ejs",{ countries: countries, total: countries.length , error : "country has already been added,try again ." });
    }
  }

}catch(err){
  console.log(err);
  const countries = await checkVisited();
  res.render("index.ejs",{ countries: countries, total: countries.length , error : "country name does not exist ." });
}

});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
