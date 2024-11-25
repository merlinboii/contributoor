import type { NextPage } from "next";
import Head from "next/head";
import { ProjectRegisterView } from "../views";

const ProjectRegister: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Solana Scaffold</title>
        <meta
          name="description"
          content="Contributor Registration"
        />
      </Head>
      <ProjectRegisterView />
    </div>
  );
};

export default ProjectRegister;
