const {Schema, model, Types} = require('mongoose');
const dateFormat = require('../utils/dateFormat');

const ReplySchema = new Schema({
    replyId: {
        type: Schema.Types.ObjectId,
        default: ()=> new Types.ObjectId()
    },
    replyBody: {
        type: String,
        required: true,
        trim: true
    },
    writtenBy: {
        type: String,
        trim: true,
        required: 'Writer name required'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        get:createdAtVal => dateFormat(createdAtVal)
    }
    },
    {
        toJSON: {
            getters: true
        }
});

const CommentSchema = new Schema({
    writtenBy: {
        type: String,
        trim: true,
        required: "Contributor's name required"
    },
    commentBody: {
        type: String,
        required: 'Comment text required',
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        get: createdAtVal => dateFormat(createdAtVal)
    },
    replies: [ReplySchema]
    },
    {
        toJSON: {
          virtuals: true,
          getters: true
        },
        id: false
      }
    );

CommentSchema.virtual('replyCount').get(function(){
    return this.replies.length;
});

const Comment = model('Comment', CommentSchema);
module.exports = Comment;