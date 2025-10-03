# Config Hosts

Configure hosts file for local development.

## 📦 Installation

You can install the package globally using npm or yarn:

```bash
# using npm
npm install -g config-hosts
# or using yarn
yarn global add config-hosts
# or using bun
bun install -g config-hosts
```


## ⚡ Usage

```bash
npx config-hosts add <ip> <aliases...> # Add a new entry to the hosts file
npx config-hosts remove <ip|alias>     # Remove an entry from the hosts file
npx config-hosts list                  # List all entries in the hosts file
```

This will prompt you to enter an IP address and a list of aliases (hostnames) that you want to associate with that IP address. The script will then append the appropriate entries to your system's hosts file.

**Note:** You may need to run the command with elevated privileges (e.g., using `sudo` on Unix-like systems) to modify the hosts file.


## ⚠ Warning

Modifying the hosts file can affect your system's ability to resolve domain names. Be cautious when adding entries, and ensure that you do not overwrite existing important entries. Always back up your hosts file before making changes.

## 🛠️ Requirements
- Node.js (>= 14.x)
- Bun (>= 0.1.0)

## 📄 License

MIT License. See the [LICENSE](LICENSE) file for details.

# contributions

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.