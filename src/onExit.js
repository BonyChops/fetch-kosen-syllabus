process.on('SIGINT', function () {
    console.log('Caught interrupt signal');

    process.exit();
});
