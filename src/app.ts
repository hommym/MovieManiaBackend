import express from "express"
import dotenv from "dotenv"
import cors from "cors";
dotenv.config()
import { connectToDatabase } from "./libs/mongoose";
import { authRouter } from "./routes/auth/authRoutes";
import { movieRouter } from "./routes/movie/movieRoutes";
import { errorHandeler } from "./middleware/errorHandler";
import { searchRouter } from "./routes/search/searchRoutes";
import { seriesRouter } from "./routes/tvSeries/tvSeriesroutes";

const app = express();




// middlewares
app.use(express.json());
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"], credentials: true }));

// routes
app.use("/api/auth",authRouter)
app.use("/api/movie",movieRouter)
app.use("/api/search",searchRouter)
app.use("/api/series",seriesRouter)
// error handling middlware
app.use(errorHandeler)



const port = process.env.PORT ? process.env.PORT : 8000;
const startServer= async()=>{

  try {
    await connectToDatabase(process.env.MongoDbConnectionUrl);

    app.listen(port, () => {
      console.log(`Server  is listening on ${port} `);
    });
  } catch (error) {
    console.log(`ServerStartUpError:${error}`)
  }


}


startServer()