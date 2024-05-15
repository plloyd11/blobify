<script>
  let file;

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) {
      alert("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/.netlify/functions/process-image", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "clipped-image.png";
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const errorText = await response.text();
      alert(`Error processing image: ${errorText}`);
    }
  };
</script>

<form on:submit|preventDefault={handleUpload}>
  <input type="file" accept="image/*" on:change={(e) => (file = e.target.files[0])} required />
  <button type="submit">Upload and Clip</button>
</form>
