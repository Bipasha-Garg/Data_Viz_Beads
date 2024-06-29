% visualise.m
% Draws density distribution plots
%**************************************************************************
function visualise(dist,intervalLen,str,colorDist)
    
    [m,n]=size(dist);
    rmax=(m+1)*intervalLen;
    degree=2*pi/n;
   
    for r=m:-1:1
        for d=1:n
            t=[(d-1)*degree:0.01:(d)*degree];
            x=[0 r*intervalLen*sin(t) 0 ];
            y=[0 r*intervalLen*cos(t) 0];
            col=chooseColor(length(dist{r,d}),colorDist);
            fill(x,y,col);
        end
    end
    
    axis square;
    set(gca,'XTick',[],'YTick',[0 intervalLen*[1:m]]);
    axis([-rmax rmax -rmax rmax+intervalLen]);
    ylabel('radius')
    grid on
    set(gca, 'XGrid', 'off','YGrid', 'off');
    text(intervalLen,rmax,str);
    for i=1:m+1
        line([0,-rmax],[(i-1)*intervalLen,(i-1)*intervalLen],'LineWidth',1,'Color',[0.8 0.8 0.8]);   
    end
    rmax=rmax+intervalLen;
    line([0,0],[-rmax,rmax],'LineWidth',1,'Color',[0.8 0.8 0.8]); 
    line([-rmax,rmax],[0,0],'LineWidth',1,'Color',[0.8 0.8 0.8]); 
end
 
%**************************************************************************