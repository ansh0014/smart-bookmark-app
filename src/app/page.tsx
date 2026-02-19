"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Bookmark {
  id: string;
  title: string;
  url: string;
}

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Get session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: any }) => {
      setSession(data.session);
      if (data.session) fetchBookmarks(data.session.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: any, session: any) => {
        setSession(session);
        if (session) fetchBookmarks(session.user.id);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Fetch bookmarks
  const fetchBookmarks = async (userId: string) => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setBookmarks(data || []);
  };

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("bookmarks-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        () => {
          if (session) fetchBookmarks(session.user.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  // Add bookmark
  const addBookmark = async () => {
    if (!title || !url) return;
    
    setIsLoading(true);
    const { error } = await supabase.from("bookmarks").insert([
      {
        title,
        url,
        user_id: session.user.id,
      },
    ]);

    if (!error && session) {
      await fetchBookmarks(session.user.id);
    }

    setTitle("");
    setUrl("");
    setIsLoading(false);
  };

  // Delete bookmark
  const deleteBookmark = async (id: string) => {
    const previousBookmarks = [...bookmarks];
    setBookmarks(bookmarks.filter(b => b.id !== id));
    
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);
    
    if (error) {
      setBookmarks(previousBookmarks);
    } else if (session) {
      await fetchBookmarks(session.user.id);
    }
  };

  // Login
  const login = async () => {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    setIsLoading(false);
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setShowMenu(false);
  };

  // Handle keyboard submission
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && title && url) {
      addBookmark();
    }
  };

  // ================= UI =================

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <main className="w-full max-w-md">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Smart Bookmark
              </h1>
              <p className="text-white/60 text-sm">
                Save and organize your favorite links
              </p>
            </div>

            <button
              onClick={login}
              disabled={isLoading}
              className="w-full bg-white hover:bg-white/90 active:bg-white/80 disabled:bg-white/50 text-black font-medium py-3 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
              aria-label="Sign in with Google"
            >
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header with Menu */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">My Bookmarks</h1>
          </div>

          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl border border-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Menu"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden z-10">
                <div className="p-4 border-b border-white/10">
                  <p className="text-white/40 text-xs mb-1">Signed in as</p>
                  <p className="text-white text-sm font-medium truncate">{session.user.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-3 text-white hover:bg-white/10 transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Add Bookmark Form */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6" aria-label="Add new bookmark">
          <h2 className="text-lg font-semibold text-white mb-4">Add Bookmark</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
              aria-label="Bookmark title"
              required
            />
            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
              aria-label="Bookmark URL"
              required
            />
            <button
              onClick={addBookmark}
              disabled={isLoading || !title || !url}
              className="bg-white hover:bg-white/90 active:bg-white/80 disabled:bg-white/50 text-black font-medium px-6 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black whitespace-nowrap"
              aria-label="Add bookmark"
            >
              {isLoading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </section>

        {/* Bookmarks List */}
        <section aria-label="Saved bookmarks">
          {bookmarks.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-2xl mb-4">
                <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white/60 mb-2">No bookmarks yet</h3>
              <p className="text-white/40 text-sm">Add your first bookmark using the form above</p>
            </div>
          ) : (
            <ul className="space-y-3" role="list">
              {bookmarks.map((bookmark) => (
                <li
                  key={bookmark.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-2 truncate">
                        {bookmark.title}
                      </h3>
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/60 hover:text-white text-sm inline-flex items-center gap-2 group break-all"
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span className="group-hover:underline">{bookmark.url}</span>
                      </a>
                    </div>
                    <button
                      onClick={() => deleteBookmark(bookmark.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 text-red-400 font-medium px-4 py-2.5 rounded-xl border border-red-500/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 whitespace-nowrap"
                      aria-label={`Delete ${bookmark.title}`}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
