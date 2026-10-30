const port = process.argv.length > 2 ? process.argv[2] : 3000;

app.use(express.static('public'));
