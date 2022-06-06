import Head from 'next/head';
import { NextPage } from 'next';
import { Board } from '../components/Board/Board';

interface Props {}

const Home: NextPage<Props> = ({}) => {
  return (
    <>
      <Head>
        <title>swept</title>
      </Head>
      <Board />
    </>
  );
};

export default Home;
