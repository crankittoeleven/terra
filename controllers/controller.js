const User = require('../models/user');
const Topic = require('../models/topic');
const Post = require('../models/post');
const Reply = require('../models/reply');
const Like = require('../models/like');
const AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

exports.home = async (req, res, next) => {
    let isLoggedIn = false;
    let user = {};
    let topics = [];
    let posts = [];
    let replies = [];
    let likes = [];
    
    let cookies = req.headers.cookie ? req.headers.cookie.split('; ') : ['email=email@test.com', 'password=nopassword'];
    let emailCookie;

    for(let i = 0; i < cookies.length; i++) {
        if(cookies[i].indexOf('email=') === 0) {
            emailCookie = cookies[i];
        }
    }

    let email = null;

    if(emailCookie) {
        email = decodeURIComponent(emailCookie).substring(emailCookie.indexOf('=') + 1);
    }

    let passwordCookie;

    for(let i = 0; i < cookies.length; i++) {
        if(cookies[i].indexOf('password=') === 0) {
            passwordCookie = cookies[i];
        }
    }

    let password = null;

    if(passwordCookie) {
        password = AES.decrypt(decodeURIComponent(passwordCookie).substring(passwordCookie.indexOf('=') + 1), 'changeit').toString(CryptoJS.enc.Utf8);
    }

    await User.findOne({email: email, password: password}).then(u => {
        if(u) {
            isLoggedIn = true;
            user = u;
        }
    });

    await Topic.find({}).then(async found => {
        topics = found;
        let j = 0;

        for(let i = 0; i < topics.length; i++) {
            try {
                await Post.find({topicId: topics[i].id}).then(async found => {
                    posts = posts.concat(found);
                    
                    for(j; j < posts.length; j++) {
                        await Reply.find({postId: posts[j].id}).then(found => {
                            replies = replies.concat(found);
                          });
                    }
                  });
            } catch(err) {
                console.log(err.message);
            }
        }
    });

    await Like.find({}).then(found => {
        likes = found;
    });

    res.render('home', {
        isLoggedIn,
        topics: topics.reverse(),
        posts,
        replies,
        user,
        likes
    });
};

exports.signupGet = (req, res, next) => {
    res.render('signup', {validation: false, user: {}});
};

exports.signupPost = async (req, res, next) => {
    let validation;
    const newUser = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
    };

    if(newUser.firstName && newUser.lastName && newUser.email && newUser.password) {
        if(newUser.password.length < 6) {
            validation = 'Password has to be 6 characters or longer.';
        }

        await User.findOne({email: newUser.email}).then(u => {
            if(u) {
                validation = 'This email address is in use.';
            }
        });

        if(!validation) {
            try {
                await User.create(newUser)
                    .then((user) => {
                        var encrypted = AES.encrypt(req.body.password, 'changeit').toString();
                        res.cookie('email', req.body.email, { maxAge: 2.16E+09, httpOnly: true });
                        res.cookie('password', encrypted, { maxAge: 2.16E+09, httpOnly: true });
                        return res.redirect('/');
                    });
            } catch(err) {
                return res.render('signup', {
                    validation: err.message,
                    user: {
                        firstName: newUser.firstName,
                        lastName: newUser.lastName,
                        email: newUser.email
                    }
                });
            }
        } else {
            return res.render('signup', {
                validation,
                user: {
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email
                }
            });
        }
    } else {
        return res.render('signup', {
            validation: 'All fields are required.',
            user: {
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email
            }
        });
    }
};

exports.signinGet = (req, res, next) => {
    res.render('signin', {validation: false, email: null, password: null});
};

exports.signinPost = async (req, res, next) => {
    await User.findOne({email: req.body.email, password: req.body.password}).then(u => {
        if(u) {
            var encrypted = AES.encrypt(req.body.password, 'changeit').toString();
            //var decrypted = AES.decrypt(encrypted, 'changeit');
            res.cookie('email', req.body.email, { maxAge: 2.16E+09, httpOnly: true });
            res.cookie('password', encrypted, { maxAge: 2.16E+09, httpOnly: true });
            return res.redirect('/');
        } else {
            res.render('signin', {validation: 'Incorrect email or password.', email: req.body.email, password: null});
        }
    });
};

exports.profileGet = async (req, res, next) => {
    let isOwner = false;
    let user = {email: '', password: ''};
    let validation = '';

    await User.findById(req.params.id).then(found => {
        user = found;
      });

    let cookies = req.headers.cookie ? req.headers.cookie.split('; ') : ['email=email@test.com', 'password=nopassword'];
    let emailCookie;

    for(let i = 0; i < cookies.length; i++) {
        if(cookies[i].indexOf('email=') === 0) {
            emailCookie = cookies[i];
        }
    }

    let email = null;

    if(emailCookie) {
        email = decodeURIComponent(emailCookie).substring(emailCookie.indexOf('=') + 1);
    }

    let passwordCookie;

    for(let i = 0; i < cookies.length; i++) {
        if(cookies[i].indexOf('password=') === 0) {
            passwordCookie = cookies[i];
        }
    }

    let password = null;

    if(passwordCookie) {
        password = AES.decrypt(decodeURIComponent(passwordCookie).substring(passwordCookie.indexOf('=') + 1), 'changeit').toString(CryptoJS.enc.Utf8);
    }

    if(password === user.password && email === user.email) {
        isOwner = true;
    }

    res.render('profile', {
        user,
        isOwner,
        validation
    });
};

exports.profilePost = async (req, res, next) => {
    let isOwner = false;
    let user = {email: '', password: ''};
    let validation = null;

    if(req.body.password.length < 6) {
        validation = 'Password has to be 6 characters or longer.';
    }

    if(!req.body.password || !req.body.email || !req.body.firstName || !req.body.lastName) {
        validation = 'All fields are required.';
    }

    await User.findById(req.params.id).then(found => {
        user = found;
      });

    let cookies = req.headers.cookie ? req.headers.cookie.split('; ') : ['email=email@test.com', 'password=nopassword'];
    let emailCookie;

    for(let i = 0; i < cookies.length; i++) {
        if(cookies[i].indexOf('email=') === 0) {
            emailCookie = cookies[i];
        }
    }

    let email = null;

    if(emailCookie) {
        email = decodeURIComponent(emailCookie).substring(emailCookie.indexOf('=') + 1);
    }

    let passwordCookie;

    for(let i = 0; i < cookies.length; i++) {
        if(cookies[i].indexOf('password=') === 0) {
            passwordCookie = cookies[i];
        }
    }

    let password = null;

    if(passwordCookie) {
        password = AES.decrypt(decodeURIComponent(passwordCookie).substring(passwordCookie.indexOf('=') + 1), 'changeit').toString(CryptoJS.enc.Utf8);
    }

    if(password === user.password && email === user.email) {
        isOwner = true;

        if(!validation) {
            try {
                await User.findByIdAndUpdate(req.params.id, { 
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password,
                    birthDate: req.body.birthDate,
                    city: req.body.city,
                    country: req.body.country,
                    twitter: req.body.twitter,
                    linkedIn: req.body.linkedIn,
                    instagram: req.body.instagram
                }).then(u => {
                    res.render('profile', {
                        user: { 
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            email: req.body.email,
                            password: req.body.password,
                            birthDate: req.body.birthDate,
                            city: req.body.city,
                            country: req.body.country,
                            twitter: req.body.twitter,
                            linkedIn: req.body.linkedIn,
                            instagram: req.body.instagram
                        },
                        isOwner,
                        validation
                    });
                });
            } catch(err) {
                res.render('profile', {
                    user,
                    isOwner,
                    validation: err.message
                });
            }
        } else {
            res.render('profile', {
                user,
                isOwner,
                validation
            });
        }
    }
};

exports.logout = async (req, res, next) => {
    res.clearCookie('email');
    res.clearCookie('password');

    return res.redirect('/');
};

exports.addGet = async (req, res, next) => {
    let user = {};
    let topic = {};
    let posts = [];
    let replies = [];
    let likes = [];
    let isLoggedIn = false;
    let validation = false;

    let cookies = req.headers.cookie ? req.headers.cookie.split('; ') : ['email=email@test.com', 'password=nopassword'];
    let emailCookie;

    for(let i = 0; i < cookies.length; i++) {
        if(cookies[i].indexOf('email=') === 0) {
            emailCookie = cookies[i];
        }
    }

    let email = null;

    if(emailCookie) {
        email = decodeURIComponent(emailCookie).substring(emailCookie.indexOf('=') + 1);
    }

    let passwordCookie;

    for(let i = 0; i < cookies.length; i++) {
        if(cookies[i].indexOf('password=') === 0) {
            passwordCookie = cookies[i];
        }
    }

    let password = null;

    if(passwordCookie) {
        password = AES.decrypt(decodeURIComponent(passwordCookie).substring(passwordCookie.indexOf('=') + 1), 'changeit').toString(CryptoJS.enc.Utf8);
    }

    await User.findOne({email: email, password: password}).then(u => {
        if(u) {
            user = u;
            isLoggedIn = true;
        } else {
            return res.redirect('/');
        }
    });

    await Topic.findById(req.params.id).then(found => {
        topic = found;
      });

    await Like.find({}).then(found => {
        likes = found;
    });

    try {
        await Post.find({topicId: topic.id}).then(async found => {
            posts = found;
            
            for(let i = 0; i < posts.length; i++) {
                await Reply.find({postId: posts[i].id}).then(found => {
                    replies = replies.concat(found);
                  });
            }
          });
    } catch(err) {
        return res.render('add', {
            validation: err.message
        });
    }

    return res.render('add', {
        user,
        topic,
        posts,
        replies,
        likes,
        isLoggedIn,
        validation
    });
};

exports.addPost = async (req, res, next) => {
    let user = {};
    let validation = false;
    let isLoggedIn = false;
    let topic = {};
    let posts = [];
    let replies = [];
    let likes = [];
    const newPost = {
        authorId: 0,
        topicId: req.params.id,
        authorFirstName: '',
        content: req.body.content
    };
    let cookies = req.headers.cookie ? req.headers.cookie.split('; ') : ['email=email@test.com', 'password=nopassword'];
    let emailCookie;

    for(let i = 0; i < cookies.length; i++) {
        if(cookies[i].indexOf('email=') === 0) {
            emailCookie = cookies[i];
        }
    }

    let email = null;

    if(emailCookie) {
        email = decodeURIComponent(emailCookie).substring(emailCookie.indexOf('=') + 1);
    }

    let passwordCookie;

    for(let i = 0; i < cookies.length; i++) {
        if(cookies[i].indexOf('password=') === 0) {
            passwordCookie = cookies[i];
        }
    }

    let password = null;

    if(passwordCookie) {
        password = AES.decrypt(decodeURIComponent(passwordCookie).substring(passwordCookie.indexOf('=') + 1), 'changeit').toString(CryptoJS.enc.Utf8);
    }

    await User.findOne({email: email, password: password}).then(u => {
        if(u) {
            user = u;
            isLoggedIn = true;

            newPost.authorId = user.id;
            newPost.authorFirstName = user.firstName
        } else {
            return res.redirect('/');
        }
    });

    await Topic.findById(req.params.id).then(found => {
        topic = found;
      });

    try {
        await Post.find({topicId: topic.id}).then(async found => {
            posts = found;
            
            for(let i = 0; i < posts.length; i++) {
                await Reply.find({postId: posts[i].id}).then(found => {
                    replies = replies.concat(found);
                  });
            }
          });
    } catch(err) {
        return res.render('add', {
            validation: err.message
        });
    }

    await Like.find({}).then(found => {
        likes = found;
    });

    try {
        if(req.body.file) {
            newPost.content = '**=' + req.body.file + '/**' + newPost.content;
        }

        await Post.create(newPost)
            .then((post) => {
                posts.push(post);
                return res.render('add', {
                    topic,
                    posts,
                    replies,
                    likes,
                    validation,
                    isLoggedIn
                });
            });
    } catch(err) {
        return res.render('add', {
            validation: err.message
        });
    }
};

exports.like = async (req, res, next) => {
    let newLike = {
        to: req.params.id
    };
    let error = null;

    let cookies = req.headers.cookie ? req.headers.cookie.split('; ') : ['email=email@test.com', 'password=nopassword'];
    let emailCookie;

    for(let i = 0; i < cookies.length; i++) {
        if(cookies[i].indexOf('email=') === 0) {
            emailCookie = cookies[i];
        }
    }

    let email = null;

    if(emailCookie) {
        email = decodeURIComponent(emailCookie).substring(emailCookie.indexOf('=') + 1);
    }

    let passwordCookie;

    for(let i = 0; i < cookies.length; i++) {
        if(cookies[i].indexOf('password=') === 0) {
            passwordCookie = cookies[i];
        }
    }

    let password = null;

    if(passwordCookie) {
        password = AES.decrypt(decodeURIComponent(passwordCookie).substring(passwordCookie.indexOf('=') + 1), 'changeit').toString(CryptoJS.enc.Utf8);
    }

    await User.findOne({email: email, password: password}).then(u => {
        if(u) {
            newLike.from = u.id;
        } else {
            error = 'You are not logged in.';
        }
    });

    await Like.findOne({from: newLike.from, to: newLike.to}).then(l => {
        if(l) {
            error = 'You have already liked this post.';
        }
    });

    if(!error) {
        try {
            await Like.create(newLike)
                .then((like) => {
                    return res.json({status: 'created'});
                });
        } catch(err) {
            return res.json({status: err});
        }
    } else {
        return res.json({status: error});
    }
};

exports.replyGet = async (req, res, next) => {
    let user = {};
    let post = {};
    let replies = [];
    let likes = 0;
    let isLoggedIn = false;
    let validation = false;

    let cookies = req.headers.cookie ? req.headers.cookie.split('; ') : ['email=email@test.com', 'password=nopassword'];
    let emailCookie;

    for(let i = 0; i < cookies.length; i++) {
        if(cookies[i].indexOf('email=') === 0) {
            emailCookie = cookies[i];
        }
    }

    let email = null;

    if(emailCookie) {
        email = decodeURIComponent(emailCookie).substring(emailCookie.indexOf('=') + 1);
    }

    let passwordCookie;

    for(let i = 0; i < cookies.length; i++) {
        if(cookies[i].indexOf('password=') === 0) {
            passwordCookie = cookies[i];
        }
    }

    let password = null;

    if(passwordCookie) {
        password = AES.decrypt(decodeURIComponent(passwordCookie).substring(passwordCookie.indexOf('=') + 1), 'changeit').toString(CryptoJS.enc.Utf8);
    }

    await User.findOne({email: email, password: password}).then(u => {
        if(u) {
            user = u;
            isLoggedIn = true;
        } else {
            return res.redirect('/');
        }
    });

    await Post.findById(req.params.id).then(found => {
        post = found;
      });

    await Like.find({to: post.id}).then(found => {
        likes = found.length;
    });

    try {
        await Reply.find({postId: post.id}).then(async found => {
            replies = found;
          });
    } catch(err) {
        return res.render('add', {
            validation: err.message
        });
    }

    return res.render('reply', {
        user,
        post,
        replies,
        likes,
        isLoggedIn,
        validation
    });
};

exports.replyPost = async (req, res, next) => {
    let user = {};
    let validation = false;
    let isLoggedIn = false;
    let post = {};
    let replies = [];
    let likes = 0;
    const newReply = {
        authorId: 0,
        postId: req.params.id,
        authorFirstName: '',
        content: req.body.content
    };
    let cookies = req.headers.cookie ? req.headers.cookie.split('; ') : ['email=email@test.com', 'password=nopassword'];
    let emailCookie;

    for(let i = 0; i < cookies.length; i++) {
        if(cookies[i].indexOf('email=') === 0) {
            emailCookie = cookies[i];
        }
    }

    let email = null;

    if(emailCookie) {
        email = decodeURIComponent(emailCookie).substring(emailCookie.indexOf('=') + 1);
    }

    let passwordCookie;

    for(let i = 0; i < cookies.length; i++) {
        if(cookies[i].indexOf('password=') === 0) {
            passwordCookie = cookies[i];
        }
    }

    let password = null;

    if(passwordCookie) {
        password = AES.decrypt(decodeURIComponent(passwordCookie).substring(passwordCookie.indexOf('=') + 1), 'changeit').toString(CryptoJS.enc.Utf8);
    }

    await User.findOne({email: email, password: password}).then(u => {
        if(u) {
            user = u;
            isLoggedIn = true;

            newReply.authorId = user.id;
            newReply.authorFirstName = user.firstName
        } else {
            return res.redirect('/');
        }
    });

    await Post.findById(req.params.id).then(found => {
        post = found;
      });

    try {
        await Reply.find({postId: post.id}).then(async found => {
            replies = found;
          });
    } catch(err) {
        return res.render('add', {
            validation: err.message
        });
    }

    await Like.find({to: post.id}).then(found => {
        likes = found.length;
    });

    try {
        await Reply.create(newReply)
            .then((reply) => {
                replies.push(reply)
                return res.render('reply', {
                    post,
                    replies,
                    likes,
                    validation,
                    isLoggedIn
                });
            });
    } catch(err) {
        return res.render('reply', {
            validation: err.message
        });
    }
};