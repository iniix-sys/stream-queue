import { useEffect, useState } from "react";
import supabase from "../lib/supabase";


function getVideoId(url) {

    try {

        const u = new URL(url);


        if (u.hostname.includes("youtu.be")) {

            return u.pathname.substring(1);

        }


        return u.searchParams.get("v");


    }

    catch {

        return null;

    }

}



export default function Player() {


    const [video, setVideo] = useState(null);



    async function loadVideo() {


        const { data, error } = await supabase

            .from("videos")

            .select("*")

            .eq("approved", true)

            .eq("played", false)

            .order(
                "created_at",
                {
                    ascending: true
                }
            )

            .limit(1)
            .single();



        if (error) {

            console.log(
                "No video:",
                error.message
            );

            setVideo(null);

            return;

        }



        setVideo(data);


    }





    useEffect(() => {


        loadVideo();



        const channel = supabase

            .channel("player_updates")

            .on(

                "postgres_changes",

                {

                    event: "*",

                    schema: "public",

                    table: "videos"

                },

                () => {

                    loadVideo();

                }

            )

            .subscribe();





        return () => {

            supabase.removeChannel(channel);

        };


    }, []);







    if (!video) {


        return (

            <div

                style={{

                    position: "fixed",

                    top: 0,

                    left: 0,

                    width: "100vw",

                    height: "100vh",

                    background: "#000",

                    color: "#fff",

                    display: "flex",

                    justifyContent: "center",

                    alignItems: "center",

                    fontFamily: "Arial, sans-serif",

                    fontSize: "40px",

                    textAlign: "center"

                }}

            >

                Waiting for video...

            </div>

        );


    }






    const videoId = getVideoId(video.url);



    if (!videoId) {


        return (

            <div

                style={{

                    position:"fixed",

                    top:0,

                    left:0,

                    width:"100vw",

                    height:"100vh",

                    background:"#000",

                    color:"#fff",

                    display:"flex",

                    justifyContent:"center",

                    alignItems:"center"

                }}

            >

                Invalid YouTube URL

            </div>

        );


    }






    return (

        <div

            style={{

                position:"fixed",

                top:0,

                left:0,

                width:"100vw",

                height:"100vh",

                background:"#000",

                display:"flex",

                justifyContent:"center",

                alignItems:"center"

            }}

        >

            <iframe

                src={
                    `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0`
                }

                title="OBS Player"

                allow="
                    autoplay;
                    fullscreen
                "

                style={{

                    width:"100%",

                    height:"100%",

                    border:"none"

                }}

            />

        </div>

    );


}