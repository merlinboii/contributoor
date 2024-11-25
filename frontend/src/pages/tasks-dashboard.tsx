import type { NextPage } from "next";
import Head from "next/head";
import { TasksDashboardView } from "../views";

const TasksDashboard: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Solana Scaffold</title>
        <meta
          name="description"
          content="Tasks Dashboard"
        />
      </Head>
      <TasksDashboardView />
    </div>
  );
};

export default TasksDashboard;
