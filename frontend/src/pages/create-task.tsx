import type { NextPage } from "next";
import Head from "next/head";
import { CreateTaskView } from "../views";

const CreateTask: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Solana Scaffold</title>
        <meta
          name="description"
          content="Create Task"
        />
      </Head>
      <CreateTaskView />
    </div>
  );
};

export default CreateTask;
