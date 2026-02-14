"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  // ---------------- AUTH ----------------
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: any, session: any) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ---------------- FETCH + REALTIME ----------------
  useEffect(() => {
    if (!user) return;

    fetchBookmarks();

    const channel = supabase
      .channel("bookmarks-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        () => {
          fetchBookmarks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    setBookmarks(data || []);
  };

  // ---------------- ADD (Optimistic) ----------------
  const addBookmark = async () => {
    if (!title || !url) return;

    const { data } = await supabase
      .from("bookmarks")
      .insert([
        {
          title,
          url,
          user_id: user.id,
        },
      ])
      .select();

    if (data) {
      setBookmarks((prev) => [data[0], ...prev]);
    }

    setTitle("");
    setUrl("");
  };

  // ---------------- DELETE (Optimistic) ----------------
  const deleteBookmark = async (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // ---------------- LOGIN SCREEN ----------------
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <button
          onClick={signIn}
          className="bg-black text-white px-6 py-3 rounded-lg text-lg hover:bg-gray-800 transition"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  // ---------------- MAIN APP ----------------
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Smart Bookmark App 🚀
            </h1>
            <p className="text-sm text-gray-500">
              Logged in as:{" "}
              <span className="font-medium">{user.email}</span>
            </p>
          </div>

          <button
            onClick={signOut}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* ADD BOOKMARK */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg font-semibold mb-4">Add New Bookmark</h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border rounded-lg p-3 flex-1 focus:outline-none focus:ring-2 focus:ring-black"
            />

            <input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="border rounded-lg p-3 flex-1 focus:outline-none focus:ring-2 focus:ring-black"
            />

            <button
              onClick={addBookmark}
              className="bg-black text-white px-6 rounded-lg hover:bg-gray-800 transition"
            >
              Add
            </button>
          </div>
        </div>

        {/* BOOKMARK LIST */}
        <div className="space-y-4">
          {bookmarks.length === 0 && (
            <p className="text-gray-500 text-center">
              No bookmarks yet. Add one!
            </p>
          )}

          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="bg-white p-5 rounded-lg shadow flex justify-between items-center"
            >
              <div>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-blue-600 hover:underline"
                >
                  {bookmark.title}
                </a>
                <p className="text-sm text-gray-500 break-all">
                  {bookmark.url}
                </p>
              </div>

              <button
                onClick={() => deleteBookmark(bookmark.id)}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
