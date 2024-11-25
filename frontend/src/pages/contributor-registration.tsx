import type { NextPage } from "next";
import Head from "next/head";
import { ContributorRegistrationView } from "../views";

const ContributorRegistration: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Solana Scaffold</title>
        <meta
          name="description"
          content="Contributor Registration"
        />
      </Head>
      <ContributorRegistrationView />
    </div>
  );
};

export default ContributorRegistration;
