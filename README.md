# HTML to PDF Resume Converter

Automatically converts HTML files (including those in ZIP archives) to PDF format. Designed to work with Notion HTML exports for resume management.

## Features

- Watches a directory for new HTML and ZIP files
- Automatically converts HTML files to PDF
- Handles ZIP files containing HTML
- Maintains consistent PDF formatting
- Can run as a background service

## Initial Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd htmlToPDFNotionResume
```

2. Install dependencies:
```bash
npm install
```

3. Make the script executable:
```bash
chmod +x convert.js
```

4. Create a global symlink (optional):
```bash
npm link
```

## Usage

### Default Configuration

Run with default settings (watches ~/Downloads/RawHTML, outputs to ~/ActiveResumes):
```bash
./convert.js
```

### Custom Directories

Specify custom watch and output directories:
```bash
./convert.js --input ~/MyHtmlFiles --output ~/MyPDFs
```

Or use short options:
```bash
./convert.js -i ~/MyHtmlFiles -o ~/MyPDFs
```

## Setup Auto-Start on macOS Login

1. Create a Launch Agent plist file:
```bash
mkdir -p ~/Library/LaunchAgents
```

2. Create file `~/Library/LaunchAgents/com.user.htmltopdf.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.user.htmltopdf</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/path/to/your/convert.js</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/htmltopdf.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/htmltopdf.error.log</string>
</dict>
</plist>
```

3. Load the Launch Agent:
```bash
launchctl load ~/Library/LaunchAgents/com.user.htmltopdf.plist
```

## File Organization

- Place HTML files or ZIPs in your watch directory
- PDFs are automatically generated in your output directory
- Temporary files are cleaned up automatically

## Note

- HTML files should be complete and self-contained
- ZIP files should contain HTML files at their root or in subdirectories
- The watcher ignores all non-HTML/ZIP files

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
