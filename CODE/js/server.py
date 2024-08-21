from livereload import Server, shell

# Specify the directory to serve
server = Server()
server.watch(
    "/home/bipasha/Desktop/research/Data_Viz_Beads/CODE/js/combined.js"
)  # Adjust the path to your JS files
server.watch(
    "/home/bipasha/Desktop/research/Data_Viz_Beads/CODE/js/start.html"
)  # Adjust the path to your HTML files
server.serve(root="http://0.0.0.0:5000/js")
