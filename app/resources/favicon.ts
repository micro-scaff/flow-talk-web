function loader(): Response {
  return new Response(null, {
    status: 204
  });
}

export { loader };
