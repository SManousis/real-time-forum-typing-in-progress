// fetch POST

fetchJwt("/api", {
  method: "POST",
  body: JSON.stringify({ content1, content2 }),
})
  .then(() => {
    showAlert("Post created successfully!", "PostAlert", 3000)
    showPage("home");
  })
  .catch(() => {
    showAlert("Something went wrong, please try again later", "playSound", 3000, 'red')
  });

// fetch GET

try {
  const res = await fetchJwt(
    `/api?arg1=${var1}&arg2=${var2}`,
    { method: "GET" }
  )
  const data = await res.json();
} catch (err) {
  showAlert("failed to fetch users", "playSound", 3000, 'red')
  return;
}

//  fetch POST with response
try {
  const res = await fetch("http://localhost:8081/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();
} catch (err) {
  console.error("Error registering user:", err);
}
