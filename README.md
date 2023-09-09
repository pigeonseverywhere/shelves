# shelves

Shelves is a command line utility to help you manage your books. Use it to:
- keep track what books you want to read
- where you're up to in a book
- notes and bookmarks 


## Installing 

### npm

If you have the NodeJS runtime installed in your system, you can install the package via:
```bash
npm install -g shelves-cli
```
Then you can use it with the keyword `shelf`. See the commands section for examples.

### homebrew

If you don't have NodeJS or would rather use Homebrew, you can also install the tool via Homebrew:
```bash
brew tap pigeonseverywhere/shelves
brew install shelves
```

## Uninstalling 
TODO

## Commands 

| Command | Flags     | Arguments | Description                                                                  |
| ------- | --------- | --------- | ---------------------------------------------------------------------------- |
| add     |           | title     | add a book to your shelf                                                     |
| remove  |           | title     | remove a book from your shelf                                                |
| list    |           |           | list all books                                                               |
| read    |           | title     | start/keeping reading a book - add notes, bookmarks, or update your progress |
| view    | --verbose | title     | view details of a book. Show bookmarks and notes when used with verbose flag |


### add

![shelf_add](https://github.com/pigeonseverywhere/shelves/assets/67492876/88dd7972-6080-48a0-aab5-2f11e0c2722f)


### list

![shelves_list](https://github.com/pigeonseverywhere/shelves/assets/67492876/0faab806-6015-4bcc-a1dc-600105b182a7)


### read
![shelf_read](https://github.com/pigeonseverywhere/shelves/assets/67492876/63c05bc0-b79c-4b3e-8c31-445d6e20dff2)

### view
![shelf_view](https://github.com/pigeonseverywhere/shelves/assets/67492876/67a9fa84-c14d-4958-96ad-16748794a28d)

When using the verbose flag:

![shelf_view_verbose](https://github.com/pigeonseverywhere/shelves/assets/67492876/cc11fccf-822b-47fb-84f2-b29b716c05b2)

### update

### remove
