const { Client } = require('./dist')

async function main() {
  const client = await Client.create(
    'yAxzQRFX97vOcyQAwluEU6H6ePxMA5eY',// process.env.CLIENT_ID
    '4dY0PjEYqoBrZ99r',// process.env.SECRET,
    'eUF4elFSRlg5N3ZPY3lRQXdsdUVVNkg2ZVB4TUE1ZVk6YVc1MlpYTjBaV010ZW1FdGNHSXRZV05qYjNWdWRITXRjMkZ1WkdKdmVBPT0=',// process.env.API_KEY,
    undefined,
    true,
  )

  return client.getAccounts().then(console.log)
}

main().catch(console.error)
