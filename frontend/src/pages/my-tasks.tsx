import type { NextPage } from "next";
import Head from "next/head";
import { UserTasksDashboardView } from "../views";

const MyTask: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Solana Scaffold</title>
        <meta
          name="description"
          content="My Tasks"
        />
      </Head>
      <UserTasksDashboardView />
    </div>
  );
};

export default MyTask;
