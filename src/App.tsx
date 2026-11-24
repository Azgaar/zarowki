import { useState } from 'react';
import { hasRoomParams, isOtherVersion, parseRoom, roomKey, roomToLink } from './game/room';
import type { Room } from './game/types';
import { BadLinkScreen } from './screens/BadLinkScreen';
import { PlayerScreen } from './screens/PlayerScreen';
import { StarterScreen } from './screens/StarterScreen';
import { VersionScreen } from './screens/VersionScreen';

// Query-param routing only: nested paths would 404 on GitHub Pages.
export function App() {
  const { search, hash } = window.location;
  const [room, setRoom] = useState(() => parseRoom(search, hash));
  // Keeps the address up to date, so a refresh stays in the same game.
  const changeRoom = (next: Room) => {
    window.history.replaceState(null, '', roomToLink(next));
    setRoom(next);
  };

  if (!hasRoomParams(search)) return <StarterScreen />;
  if (isOtherVersion(search)) return <VersionScreen />;
  return room ? <PlayerScreen key={roomKey(room)} room={room} onRoomChange={changeRoom} /> : <BadLinkScreen />;
}
