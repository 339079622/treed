
module.exports = Tags

function Tags(tags, actions, modelactions) {
  this.actions = actions
  this.modelactions = modelactions
  this.setupNode()
  this.set(tags)
}

Tags.prototype = {
  setupNode: function () {
    this.node = document.createElement('div')
    this.node.className = 'treed_tags'

    this.handle = document.createElement('div')
    this.handle.className = 'treed_tags_handle'
    this.handle.addEventListener('click', this.startEditing.bind(this))
    this.handle.innerHTML = '<i class="fa fa-tag"/>'

    this.tags = document.createElement('div')
    this.tags.className = 'treed_tags_list'

    this.editor = document.createElement('div')
    this.editor.className = 'treed_tags_editor'

    this.input = document.createElement('input')
    this.input.className = 'treed_tags_input'

    this.input.addEventListener('keydown', this.keyDown.bind(this))
    this.input.addEventListener('keyup', this.keyUp.bind(this))
    this.input.addEventListener('blur', this.onBlur.bind(this))

    this.resultsNode = document.createElement('ul')
    this.resultsNode.className = 'treed_tags_results'
    this.resultsNode.addEventListener('mousedown', function (e) {e.preventDefault()})

    this.node.appendChild(this.tags)
    this.node.appendChild(this.handle)
    this.node.appendChild(this.editor)

    this.editor.appendChild(this.input)
    this.editor.appendChild(this.resultsNode)

    this.dom = {}
  },

  startEditing: function (e) {
    if (this.editing) return
    this.editing = true
    this.node.classList.add('treed_tags--open')
    this.fullResults = this.modelactions.getAllTags()
    this.filterBy('')
    this.selection = 0
    this.input.value = ''
    this.input.focus()
    this.showResults()
    // todo show everything first? I think I'll wait for first key change
  },

  doneEditing: function (e) {
    if (!this.editing) return
    this.editing = false
    this.node.classList.remove('treed_tags--open')
    this.actions.setTags(this.value.map(function (x){ return x.id }))
  },

  onBlur: function () {
    this.doneEditing()
  },

  keys: {
    27: function (e) {
      e.preventDefault()
      this.doneEditing()
    },
    9: function (e) {
      e.preventDefault()
      this.addCurrent()
      this.doneEditing()
    },
    13: function (e) {
      e.preventDefault()
      this.addCurrent()
    },
    8: function (e) {
      if (!this.input.value) {
        e.preventDefault()
        this.removeLast()
      }
    },
  },

  keyDown: function (e) {
    var action = this.keys[e.keyCode]
    if (action) return action.call(this, e)
  },

  keyUp: function (e) {
    this.filterBy(this.input.value)
    this.showResults()
  },

  filterBy: function (needle) {
    var used = {}
    for (var i=0; i<this.value.length; i++) {
      used[this.value[i].id] = true
    }
    if (!needle) {
      this.results = this.fullResults.filter(function (tag) {
        return !used[tag.id]
      })
    } else {
      needle = needle.toLowerCase()
      this.results = this.fullResults.filter(function (tag) {
        return !used[tag.id] && tag.content.toLowerCase().indexOf(needle) !== -1
      })
    }
  },

  showResults: function () {
    while (this.resultsNode.lastChild) {
      this.resultsNode.removeChild(this.resultsNode.lastChild)
    }
    var num = 5
    if (num > this.results.length) num = this.results.length
    var click = function (tag, e) {
      e.preventDefault()
      this.addCurrent(tag)
    }
    for (var i=0; i<num; i++) {
      var node = document.createElement('li')
      node.innerText = this.results[i].content
      node.className = 'treed_tags_result'
      node.addEventListener('click', click.bind(this, this.results[i]))
      this.resultsNode.appendChild(node)
    }
  },

  addCurrent: function (tag) {
    if (!this.results.length) return
    tag = tag || this.results[this.selection]
    if (this.value.indexOf(tag) !== -1) return this.resetSearch()
    this.value.push(tag)
    this.add(tag)
    this.resetSearch()
  },

  resetSearch: function () {
    this.input.value = ''
    this.filterBy('')
    this.selection = 0
    this.showResults()
  },

  removeLast: function () {
    if (!this.value.length) return
    var last = this.value.pop()
    this.tags.removeChild(this.dom[last.id])
  },

  /*
  startEditing: function (e) {
    e.preventDefault();

    this.node.removeChild(this.handle)
    this.node.removeChild(this.tags)

    editTags(this.node, this.modelactions.getTagList(), function (tags) {
      this.node.appendChild(this.handle)
      this.node.appendChild(this.tags)
      this.actions.setTags(tags)
    }.bind(this))

  },
 */

  set: function (tags) {
    this.value = tags || []
    while (this.tags.lastChild) this.tags.removeChild(this.tags.lastChild)
    this.dom = {}
    this.value.map(this.add.bind(this))
  },

  add: function (tag) {
    var node = document.createElement('div')
    this.dom[tag.id] = node
    node.className = 'treed_tag'
    node.innerHTML = tag.content
    node.addEventListener('click', function (e) {
      e.preventDefault()
      e.stopPropagation()
      this.actions.rebase(tag.id)
    }.bind(this))
    this.tags.appendChild(node)
  },
}

