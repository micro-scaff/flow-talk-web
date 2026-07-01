import {
  redirect
} from "react-router";

export function loader(): Response {
  return redirect("/login");
}

export default function Home(): null {
  return null;
}
