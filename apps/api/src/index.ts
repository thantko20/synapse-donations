import { serve } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { appRouter } from "./trpc/index.js";

const app = new Hono();

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
	}),
);

serve(
	{
		fetch: app.fetch,
		port: 4000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
