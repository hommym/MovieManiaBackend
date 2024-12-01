"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const mongoose_1 = require("./libs/mongoose");
const authRoutes_1 = require("./routes/auth/authRoutes");
const movieRoutes_1 = require("./routes/movie/movieRoutes");
const errorHandler_1 = require("./middleware/errorHandler");
const searchRoutes_1 = require("./routes/search/searchRoutes");
const tvSeriesroutes_1 = require("./routes/tvSeries/tvSeriesroutes");
const liveRoutes_1 = require("./routes/live/liveRoutes");
const setUpAllEventsListners_1 = require("./components/events/setUpAllEventsListners");
const app = (0, express_1.default)();
// middlewares
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"], credentials: true }));
// routes
app.use("/api/auth", authRoutes_1.authRouter);
app.use("/api/movie", movieRoutes_1.movieRouter);
app.use("/api/search", searchRoutes_1.searchRouter);
app.use("/api/series", tvSeriesroutes_1.seriesRouter);
app.use("/api/live", liveRoutes_1.liveRouter);
// const frontendPath = join(__dirname, "..", "/public"); // Replace 'frontend' with your folder name
// app.use(express.static(frontendPath));
// app.get("*", (req, res) => {
//   res.sendFile(join(frontendPath, "index.html"));
// });
// error handling middlware
app.use(errorHandler_1.errorHandeler);
const port = process.env.PORT ? process.env.PORT : 8000;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, mongoose_1.connectToDatabase)(process.env.MongoDbConnectionUrl);
        (0, setUpAllEventsListners_1.setUpAllEventListners)();
        app.listen(port, () => {
            console.log(`Server  is listening on ${port} `);
        });
    }
    catch (error) {
        console.log(`ServerStartUpError:${error}`);
    }
});
startServer();
