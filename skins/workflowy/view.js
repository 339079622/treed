
var View = require('../../lib/view')

module.exports = WFView

function WFView() {
  View.apply(this, arguments)
}

WFView.prototype = Object.create(View.prototype)

WFView.prototype.setTags = function (id, tags) {
  this.setAttr(id, 'tags', tags)
  // todo update references
  for (var i=0; i<tags.length; i++) {
    this.setAttr(tags[i], 'references', this.model.ids[tags[i]].meta.references, true)
  }
}

WFView.prototype.extra_actions = {
  'edit tags': {
    binding: 'shift+3',
    action: function () {
      this.vl.editTags(this.active)
    },
  },
  'rebase': {
    binding: 'alt+return',
    action: function () {
      this.ctrlactions.clickBullet(this.active)
    }
  },
  'back a level': {
    binding: 'shift+alt+return',
    action: function () {
      this.ctrlactions.backALevel()
    }
  },
  'toggle done': {
    binding: 'ctrl+return',
    action: function () {
      if (this.active === null) return
      var id = this.active
        , done = !this.model.ids[id].meta.done
        , next = this.model.idBelow(id, this.root)
      if (next === undefined) next = id
      this.ctrlactions.changed(this.active, 'done', done)
      if (done) {
        this.goTo(next)
      }
    }
  }
}

