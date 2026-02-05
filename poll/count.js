import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

const POLL_COLLECTION = "Mirror-XR-AF26-poll-magical-item";

export async function getMajorityForLevel(db, levelId, showId) {
  const q = query(
    collection(db, POLL_COLLECTION),
    where("levelId", "==", levelId),
    where("showId", "==", showId)
  );

  const snapshot = await getDocs(q);

  const counts = { a: 0, b: 0, c: 0, d: 0 };

  snapshot.forEach(doc => {
    const data = doc.data();
    if (counts[data.pollKey] !== undefined) {
      counts[data.pollKey]++;
    }
  });

  
  let winner = null;
  let max = -1;

  for (const key in counts) {
    if (counts[key] > max) {
      max = counts[key];
      winner = key;
    }
  }

  return {
    winner,
    counts
  };
}
