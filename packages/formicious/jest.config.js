module.exports = {
    rootDir: './src',
    testEnvironment: 'node',
    globals: {
        // https://stackoverflow.com/questions/52612122/how-to-use-jest-to-test-functions-using-crypto-or-window-mscrypto
        crypto: {
            getRandomValues: (arr) => require('crypto').randomBytes(arr.length)
        }
    }
}