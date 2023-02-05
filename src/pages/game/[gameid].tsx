import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { Game, usePlayer, watchGame } from '../../hive-db';
import { GameOnline } from '../../components/game-online/GameOnline';
import { GameOnlineSidebar } from '../../components/game-online/GameOnlineSidebar';
import { NavBar } from '../../components/nav/NavBar';
import { useNotifications } from '../../contexts/notifications/NotificationProvider';
import { useTitle } from '../../hooks/useTitle';
import { useGameDispatch } from '../../state/game-online/hooks';
import { gameChanged, uidChanged } from '../../state/game-online/slice';
import store from '../../state/game-online/store';
import Head from 'next/head';

const GameView = ({ uid, game }: { uid: string | null; game: Game }) => {
  const dispatch = useGameDispatch();
  const { notifications, markRead } = useNotifications();

  /**
   * The game is the actual source of truth, so tell the store when it changes
   * so that the game interface can update accordingly.
   */
  useEffect(() => {
    dispatch(gameChanged(game));
  }, [game, dispatch]);

  /**
   * We also need to know who is viewing the game so that we know what level
   * of interactivity to provide.
   */
  useEffect(() => {
    dispatch(uidChanged(uid));
  }, [uid, dispatch]);

  /**
   * If there's a notification that it's the user's turn in this game, mark it
   * as read since we're already here.
   */
  useEffect(() => {
    const notification = notifications.find((n) => {
      return n.gid === game.gid && !n.read;
    });
    if (notification) {
      markRead([notification]);
    }
  }, [notifications, markRead, game]);

  return (
    <>
      <div className='w-full sm:w-1/3 px-2'>
        <GameOnlineSidebar />
      </div>
      <div className='w-full min-h-[500px] sm:w-2/3 pt-1 px-2'>
        <GameOnline uid={uid} game={game} />
      </div>
    </>
  );
};

const Game = () => {
  const router = useRouter();
  const { uid } = usePlayer();
  const { gameid } = router.query;
  const [game, setGame] = useState<Game | undefined>();
  const title = useTitle();

  useEffect(() => {
    if (typeof gameid === 'string') {
      return watchGame(gameid, setGame, () => setGame(undefined));
    }
  }, [gameid]);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <NavBar fullWidth className='border-b' />
      <div className='container mx-auto'>
        <div className='flex flex-row flex-row-reverse flex-wrap py-4'>
          <Provider store={store}>
            {game ? <GameView uid={uid} game={game} /> : <div className='grid w-screen h-screen place-items-center'>Loading...</div> }
          </Provider>
        </div>
      </div>
    </>
  );
};

export default Game;
