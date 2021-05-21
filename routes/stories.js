const express = require('express');
const router = express.Router();
const {ensureAuth} = require('../middleware/auth');
const Story = require('../models/Story'); 

//SHOW 'ADD STORY' PAGE
//route: GET /stories/add
router.get('/add', ensureAuth,  (req, res) => {
    res.render('stories/add.hbs');
})

//SHOW 'PROCESS THE ADD FORM
//route: POST /stories
router.post('/', ensureAuth, async (req, res) => {
    try{
        req.body.user = req.user.id;
        await Story.create(req.body)
        res.redirect('/dashboard');
    }catch(err){
        res.render('errors/500.hbs')
    }
})

//SHOW ALL PUBLIC STORIES
router.get('/', ensureAuth, async (req, res) => {
    try{
        const stories = await Story.find({status: 'public'})
        .populate('user')
        .sort({createdAt: 'desc'})
        .lean();

        res.render('stories/index.hbs', {
            stories: stories
        })
    }catch(err){
        console.log(err);
        res.render('errors/500.hbs');   
    }
});

//GET SINGLE STORY
router.get('/:id', async (req, res) => {
    try{
        let story = await Story.findById(req.params.id).populate('user').lean();
        if(!story){
            res.render('errors/404.hbs');
        }
        res.render('stories/show.hbs',{
            story: story
        });
    }catch(err){
        console.log(err);
        res.render('errors/404.hbs');
    }
})


//EDIT STORY
router.get('/edit/:id', ensureAuth, async (req, res) => {
    const story = await Story.findOne({_id:req.params.id }).lean();
    if(!story){
        return res.render('errors/.404.hbs');
    }

    if(story.user != req.user.id){
        res.redirect('/stories');
    }else{
        res.render('stories/edit.hbs', {
            story: story
        });
    }
});

//SHOW 'UPDATE STORY' PAGE
//route: GET /stories/id
router.put('/:id', ensureAuth, async (req, res) => {
    let story = await Story.findById(req.params.id).lean();

    if(!story){
        return res.render('errors/404.hbs');
    }
    if(story.user != req.user.id){
        res.redirect('/stories');
    }else{
        story = await Story.findOneAndUpdate({_id: req.params.id}, req.body, {
            new: true,
            runValidators: true
        });
        res.redirect('/dashboard');
    }
});

//DELETE STORY
router.delete('/:id', ensureAuth, async (req, res) => {
    try{
        await Story.remove({_id: req.params.id});
        res.redirect('/dashboard');
    }catch(err){
        console.log(err);
        res.render('errors/500.hbs');
    }
});

//USER STORIES
router.get('/user/:userId', ensureAuth, async (req, res) => {
    try{
        const stories = await Story.find({
            user: req.params.userId,
            status: 'public'
        }).populate('user').lean();

        res.render('stories/index.hbs', {
            stories: stories
        })
    }catch(err){
        console.log(err);
        res.render('errors/500.hbs');
    }
})

module.exports = router;