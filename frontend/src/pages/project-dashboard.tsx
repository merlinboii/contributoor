import type { NextPage } from "next";
import Head from "next/head";
import { ProjectDashboardView } from "../views";

const ProjectDashboard: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Solana Scaffold</title>
        <meta
          name="description"
          content="Contributor Registration"
        />
      </Head>
      <ProjectDashboardView />
    </div>
  );
};

export default ProjectDashboard;
