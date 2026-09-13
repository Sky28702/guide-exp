"use client";

export default function LogoutButton() {
  const logout = () => {
    localStorage.removeItem("authUser");
    localStorage.removeItem("isLoggedIn");

    window.location.href = "/";
  };

  return (
    <button
      onClick={logout}
      className="rounded-xl bg-black px-5 py-3 text-white"
    >
      Logout
    </button>
  );
}
